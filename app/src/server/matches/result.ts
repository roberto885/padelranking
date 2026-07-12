import { z } from "zod";

const setScore = z.object({ team1: z.number().int().min(0).max(7), team2: z.number().int().min(0).max(7) }).superRefine((set, ctx) => {
  const high = Math.max(set.team1, set.team2), low = Math.min(set.team1, set.team2);
  const valid = (high === 6 && low <= 4) || (high === 7 && (low === 5 || low === 6));
  if (!valid) ctx.addIssue({ code: "custom", message: "Invalid completed set score" });
});

export const resultSchema = z.object({ sets: z.array(setScore).min(1).max(5) }).superRefine(({ sets }, ctx) => {
  let team1 = 0, team2 = 0;
  for (const set of sets) {
    if (set.team1 > set.team2) team1++;
    else team2++;
  }
  if (team1 === team2) ctx.addIssue({ code: "custom", message: "Match must have one winner" });
  const needed = sets.length <= 3 ? 2 : 3;
  if (Math.max(team1, team2) !== needed) ctx.addIssue({ code: "custom", message: `Winner must win ${needed} sets` });
  if (sets.slice(0, -1).filter(s => s.team1 > s.team2).length >= needed || sets.slice(0, -1).filter(s => s.team2 > s.team1).length >= needed) ctx.addIssue({ code: "custom", message: "Sets recorded after match was won" });
});

export type Team = 1 | 2;
export type Participant = { playerId: string; team: Team };
export type Submission = { id: string; matchId: string; submittedBy: string; idempotencyKey: string; sets: Array<{ team1: number; team2: number }>; winningTeam: Team; status: "pending" | "accepted" | "disputed"; createdAt: Date; confirmAfter: Date };
export type MatchResultState = { matchId: string; status: "scheduled" | "pending_confirmation" | "confirmed" | "disputed"; participants: Participant[]; submission?: Submission; confirmedAt?: Date };

function teamOf(state: MatchResultState, playerId: string): Team {
  const participant = state.participants.find(p => p.playerId === playerId);
  if (!participant) throw new Error("NOT_A_PARTICIPANT");
  return participant.team;
}

export function submitResult(state: MatchResultState, input: { submissionId: string; playerId: string; idempotencyKey: string; sets: unknown; now: Date }): MatchResultState {
  if (state.submission?.idempotencyKey === input.idempotencyKey) return state;
  if (state.status !== "scheduled") throw new Error("MATCH_NOT_SUBMITTABLE");
  teamOf(state, input.playerId);
  const parsed = resultSchema.parse({ sets: input.sets });
  const team1Wins = parsed.sets.filter(s => s.team1 > s.team2).length;
  const team2Wins = parsed.sets.length - team1Wins;
  const submission: Submission = { id: input.submissionId, matchId: state.matchId, submittedBy: input.playerId, idempotencyKey: input.idempotencyKey, sets: parsed.sets, winningTeam: team1Wins > team2Wins ? 1 : 2, status: "pending", createdAt: input.now, confirmAfter: new Date(input.now.getTime() + 24 * 60 * 60 * 1000) };
  return { ...state, status: "pending_confirmation", submission };
}

export function verifyResult(state: MatchResultState, playerId: string, now: Date): MatchResultState {
  if (state.status === "confirmed") return state;
  if (state.status !== "pending_confirmation" || !state.submission) throw new Error("RESULT_NOT_PENDING");
  const verifierTeam = teamOf(state, playerId), submitterTeam = teamOf(state, state.submission.submittedBy);
  if (verifierTeam === submitterTeam) throw new Error("OPPONENT_CONFIRMATION_REQUIRED");
  return { ...state, status: "confirmed", submission: { ...state.submission, status: "accepted" }, confirmedAt: now };
}

export function disputeResult(state: MatchResultState, playerId: string, reason: string): MatchResultState {
  if (state.status !== "pending_confirmation" || !state.submission) throw new Error("RESULT_NOT_PENDING");
  const disputingTeam = teamOf(state, playerId), submitterTeam = teamOf(state, state.submission.submittedBy);
  if (disputingTeam === submitterTeam) throw new Error("OPPONENT_DISPUTE_REQUIRED");
  if (!reason.trim()) throw new Error("DISPUTE_REASON_REQUIRED");
  return { ...state, status: "disputed", submission: { ...state.submission, status: "disputed" } };
}

export function confirmExpiredResult(state: MatchResultState, now: Date): MatchResultState {
  if (state.status === "confirmed") return state;
  if (state.status !== "pending_confirmation" || !state.submission) throw new Error("RESULT_NOT_PENDING");
  if (now < state.submission.confirmAfter) throw new Error("CONFIRMATION_DEADLINE_NOT_REACHED");
  return { ...state, status: "confirmed", submission: { ...state.submission, status: "accepted" }, confirmedAt: now };
}
