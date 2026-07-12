import { describe, expect, it } from "vitest";
import { confirmAndRate, type ConfirmableMatch, type ConfirmationTransaction, type StoredRatingTransaction, type TransactionRunner } from "./confirm-and-rate";
import type { Formula, RatingChange } from "../ratings/glicko2";

const formula: Formula = { id: "v1", tau: .5, competitionWeight: 1, repeatFactor: 1, provisionalMatches: 10, floor: 500, ceiling: 3000 };
const rating = { value: 1500, deviation: 200, volatility: .06, matches: 2 };
const match = (): ConfirmableMatch => ({ id: "m1", clubId: "club-a", status: "pending_confirmation", winningTeam: 1, participants: [{ playerId: "a", rating, team: 1 }, { playerId: "b", rating, team: 1 }, { playerId: "c", rating, team: 2 }, { playerId: "d", rating, team: 2 }] });

function memoryRunner(initial = match(), failAt?: string) {
  let state = structuredClone(initial); const transactions: StoredRatingTransaction[] = []; const audits: unknown[] = []; const ratings = new Map<string, RatingChange>();
  const runner: TransactionRunner = { transaction: async work => {
    const before = structuredClone(state), transactionCount = transactions.length, auditCount = audits.length;
    const tx: ConfirmationTransaction = {
      lockMatch: async () => state,
      hasRatingTransactions: async () => transactions.length > 0,
      updatePlayerRating: async (id, change) => { if (failAt === `rating:${id}`) throw new Error("WRITE_FAILED"); ratings.set(id, change); },
      insertRatingTransaction: async value => { transactions.push(value); },
      markMatchConfirmed: async () => { state.status = "confirmed"; },
      writeAudit: async event => { audits.push(event); },
    };
    try { return await work(tx); } catch (error) { state = before; transactions.splice(transactionCount); audits.splice(auditCount); ratings.clear(); throw error; }
  } };
  return { runner, transactions, audits, ratings, get state() { return state; } };
}

describe("atomic result confirmation", () => {
  it("confirms and writes exactly four rating transactions", async () => { const x = memoryRunner(); const result = await confirmAndRate({ matchId: "m1", actorUserId: "c", confirmedAt: new Date(), formula }, x.runner); expect(result.status).toBe("confirmed"); expect(x.state.status).toBe("confirmed"); expect(x.transactions).toHaveLength(4); expect(x.ratings.size).toBe(4); expect(x.audits).toHaveLength(1); });
  it("turns a retry into a no-op", async () => { const x = memoryRunner(); await confirmAndRate({ matchId: "m1", actorUserId: "c", confirmedAt: new Date(), formula }, x.runner); const retry = await confirmAndRate({ matchId: "m1", actorUserId: "c", confirmedAt: new Date(), formula }, x.runner); expect(retry.status).toBe("already_confirmed"); expect(x.transactions).toHaveLength(4); });
  it("rolls back all effects if one player update fails", async () => { const x = memoryRunner(match(), "rating:c"); await expect(confirmAndRate({ matchId: "m1", actorUserId: null, confirmedAt: new Date(), formula }, x.runner)).rejects.toThrow("WRITE_FAILED"); expect(x.state.status).toBe("pending_confirmation"); expect(x.transactions).toHaveLength(0); expect(x.audits).toHaveLength(0); });
  it("rejects disputed results", async () => { const x = memoryRunner({ ...match(), status: "disputed" }); await expect(confirmAndRate({ matchId: "m1", actorUserId: "admin", confirmedAt: new Date(), formula }, x.runner)).rejects.toThrow("DISPUTED_RESULT_CANNOT_CONFIRM"); });
  it("detects corrupted confirmed state instead of silently skipping history", async () => { const x = memoryRunner({ ...match(), status: "confirmed" }); await expect(confirmAndRate({ matchId: "m1", actorUserId: "admin", confirmedAt: new Date(), formula }, x.runner)).rejects.toThrow("CONFIRMED_MATCH_MISSING_RATING_HISTORY"); });
});
