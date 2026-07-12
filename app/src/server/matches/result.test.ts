import { describe, expect, it } from "vitest";
import { confirmExpiredResult, disputeResult, resultSchema, submitResult, verifyResult, type MatchResultState } from "./result";

const now = new Date("2026-07-11T18:00:00Z");
const base = (): MatchResultState => ({ matchId: "m1", status: "scheduled", participants: [{ playerId: "a", team: 1 }, { playerId: "b", team: 1 }, { playerId: "c", team: 2 }, { playerId: "d", team: 2 }] });
const pending = () => submitResult(base(), { submissionId: "s1", playerId: "a", idempotencyKey: "key-1", sets: [{ team1: 6, team2: 3 }, { team1: 4, team2: 6 }, { team1: 7, team2: 5 }], now });

describe("padel result validation", () => {
  it("accepts a valid best-of-three result", () => expect(resultSchema.safeParse({ sets: [{ team1: 6, team2: 3 }, { team1: 7, team2: 6 }] }).success).toBe(true));
  it("rejects impossible and unfinished scores", () => { expect(resultSchema.safeParse({ sets: [{ team1: 6, team2: 6 }, { team1: 6, team2: 1 }] }).success).toBe(false); expect(resultSchema.safeParse({ sets: [{ team1: 6, team2: 4 }] }).success).toBe(false); });
  it("rejects sets after the match has been won", () => expect(resultSchema.safeParse({ sets: [{ team1: 6, team2: 0 }, { team1: 6, team2: 0 }, { team1: 0, team2: 6 }] }).success).toBe(false));
});

describe("result confirmation policy", () => {
  it("makes duplicate submission idempotent", () => { const state = pending(); expect(submitResult(state, { submissionId: "different", playerId: "a", idempotencyKey: "key-1", sets: [], now })).toBe(state); });
  it("allows an opponent to confirm immediately", () => expect(verifyResult(pending(), "c", now).status).toBe("confirmed"));
  it("does not allow a submitter teammate to confirm", () => expect(() => verifyResult(pending(), "b", now)).toThrow("OPPONENT_CONFIRMATION_REQUIRED"));
  it("allows an opponent to dispute with a reason", () => expect(disputeResult(pending(), "d", "Second set was 6-3").status).toBe("disputed"));
  it("confirms only after the full 24-hour deadline", () => { expect(() => confirmExpiredResult(pending(), new Date(now.getTime() + 86_399_999))).toThrow("CONFIRMATION_DEADLINE_NOT_REACHED"); expect(confirmExpiredResult(pending(), new Date(now.getTime() + 86_400_000)).status).toBe("confirmed"); });
  it("is safe when confirmation is retried", () => { const confirmed = verifyResult(pending(), "c", now); expect(confirmExpiredResult(confirmed, new Date(now.getTime() + 86_400_000))).toBe(confirmed); });
});
