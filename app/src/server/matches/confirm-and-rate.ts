import { calculateDoubles, type Formula, type RatedPlayer, type RatingChange } from "../ratings/glicko2";

export type ConfirmableMatch = {
  id: string; clubId: string; status: "pending_confirmation" | "confirmed" | "disputed";
  winningTeam: 1 | 2; participants: Array<RatedPlayer & { team: 1 | 2 }>;
};
export type StoredRatingTransaction = RatingChange & { matchId: string; clubId: string; formulaId: string };

export interface ConfirmationTransaction {
  lockMatch(matchId: string): Promise<ConfirmableMatch | null>;
  hasRatingTransactions(matchId: string): Promise<boolean>;
  updatePlayerRating(playerId: string, change: RatingChange): Promise<void>;
  insertRatingTransaction(transaction: StoredRatingTransaction): Promise<void>;
  markMatchConfirmed(matchId: string, confirmedAt: Date): Promise<void>;
  writeAudit(event: { clubId: string; actorUserId: string | null; action: string; targetType: string; targetId: string; after: unknown }): Promise<void>;
}
export interface TransactionRunner { transaction<T>(work: (tx: ConfirmationTransaction) => Promise<T>): Promise<T> }

export async function confirmAndRate(input: { matchId: string; actorUserId: string | null; confirmedAt: Date; formula: Formula }, runner: TransactionRunner) {
  return runner.transaction(async tx => {
    const match = await tx.lockMatch(input.matchId);
    if (!match) throw new Error("MATCH_NOT_FOUND");
    if (match.status === "disputed") throw new Error("DISPUTED_RESULT_CANNOT_CONFIRM");
    if (match.status === "confirmed") {
      if (!(await tx.hasRatingTransactions(match.id))) throw new Error("CONFIRMED_MATCH_MISSING_RATING_HISTORY");
      return { status: "already_confirmed" as const, changes: [] };
    }
    const team1 = match.participants.filter(p => p.team === 1);
    const team2 = match.participants.filter(p => p.team === 2);
    const snapshot = calculateDoubles({ team1, team2, winningTeam: match.winningTeam, formula: input.formula });
    for (const change of snapshot.changes) {
      await tx.updatePlayerRating(change.playerId, change);
      await tx.insertRatingTransaction({ ...change, matchId: match.id, clubId: match.clubId, formulaId: input.formula.id });
    }
    await tx.markMatchConfirmed(match.id, input.confirmedAt);
    await tx.writeAudit({ clubId: match.clubId, actorUserId: input.actorUserId, action: "match.result.confirmed", targetType: "match", targetId: match.id, after: { confirmedAt: input.confirmedAt, formulaId: input.formula.id, winningTeam: match.winningTeam } });
    return { status: "confirmed" as const, changes: snapshot.changes };
  });
}
