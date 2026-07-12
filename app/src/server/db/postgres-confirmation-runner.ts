import type { TransactionSql } from "postgres";
import { database } from "./client";
import type { ConfirmationTransaction, ConfirmableMatch, StoredRatingTransaction, TransactionRunner } from "../matches/confirm-and-rate";
import type { RatingChange } from "../ratings/glicko2";

type MatchRow = { id: string; club_id: string; status: ConfirmableMatch["status"]; winning_team: 1 | 2 };
type ParticipantRow = { player_id: string; team: 1 | 2; rating: number; rating_deviation: number; matches: number };

class PostgresConfirmationTransaction implements ConfirmationTransaction {
  constructor(private readonly sql: TransactionSql) {}

  async lockMatch(matchId: string): Promise<ConfirmableMatch | null> {
    const rows = await this.sql<MatchRow[]>`
      select m.id, m.club_id, m.status, ss.winning_team
      from matches m join score_submissions ss on ss.id = m.official_submission_id
      where m.id = ${matchId} for update of m`;
    if (!rows[0]) return null;
    const participants = await this.sql<ParticipantRow[]>`
      select mp.player_profile_id as player_id, mp.team, p.rating, p.rating_deviation,
             coalesce((select count(*)::int from rating_transactions rt where rt.player_profile_id = p.id), 0) as matches
      from match_participants mp join player_profiles p on p.id = mp.player_profile_id
      where mp.match_id = ${matchId} order by mp.team, mp.position`;
    return { id: rows[0].id, clubId: rows[0].club_id, status: rows[0].status, winningTeam: rows[0].winning_team, participants: participants.map(p => ({ playerId: p.player_id, team: p.team, rating: { value: p.rating, deviation: p.rating_deviation, volatility: .06, matches: p.matches } })) };
  }

  async hasRatingTransactions(matchId: string) { const rows = await this.sql<{ count: number }[]>`select count(*)::int as count from rating_transactions where match_id = ${matchId}`; return rows[0].count === 4; }
  async updatePlayerRating(playerId: string, change: RatingChange) { await this.sql`update player_profiles set rating = ${Math.round(change.after.value)}, rating_deviation = ${Math.round(change.after.deviation)}, updated_at = now() where id = ${playerId}`; }
  async insertRatingTransaction(value: StoredRatingTransaction) {
    await this.sql`insert into rating_transactions (club_id, match_id, player_profile_id, formula_version_id, rating_before, rating_after, deviation_before, deviation_after, expected_probability_bps, snapshot, explanation)
      values (${value.clubId}, ${value.matchId}, ${value.playerId}, ${value.formulaId}, ${Math.round(value.before.value)}, ${Math.round(value.after.value)}, ${Math.round(value.before.deviation)}, ${Math.round(value.after.deviation)}, ${Math.round(value.expectedWinProbability * 10000)}, ${this.sql.json(value)}, ${value.explanation})`;
  }
  async markMatchConfirmed(matchId: string, confirmedAt: Date) { await this.sql`update matches set status = 'confirmed', confirmed_at = ${confirmedAt}, updated_at = now() where id = ${matchId}`; }
  async writeAudit(event: { clubId: string; actorUserId: string | null; action: string; targetType: string; targetId: string; after: unknown }) { await this.sql`insert into audit_logs (club_id, actor_user_id, action, target_type, target_id, after) values (${event.clubId}, ${event.actorUserId}, ${event.action}, ${event.targetType}, ${event.targetId}, ${this.sql.json(event.after as never)})`; }
}

export class PostgresConfirmationRunner implements TransactionRunner {
  async transaction<T>(work: (tx: ConfirmationTransaction) => Promise<T>): Promise<T> {
    // postgres.js models callbacks that may return arrays; this runner only accepts one value.
    return await database().begin(async sql => work(new PostgresConfirmationTransaction(sql))) as T;
  }
}
