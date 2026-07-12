import { describe, expect, it } from "vitest";
import { generateSchedule, type Court, type SchedulableMatch } from "./scheduler";
const at = (hour: number, minute = 0) => new Date(Date.UTC(2026, 6, 11, hour, minute));
const court = (id: string): Court => ({ id, availableFrom: at(8), availableUntil: at(14), blackouts: [] });
const match = (id: string, players: string[]): SchedulableMatch => ({ id, participantIds: players, durationMinutes: 60, earliest: at(8), latestFinish: at(14) });

describe("basic court scheduler", () => {
  it("uses parallel courts without player conflicts", () => { const result = generateSchedule({ matches: [match("m1", ["a","b","c","d"]), match("m2", ["e","f","g","h"])], courts: [court("c1"), court("c2")], slotMinutes: 30, minimumRestMinutes: 30 }); expect(result.assignments).toHaveLength(2); expect(result.assignments[0].startsAt).toEqual(result.assignments[1].startsAt); });
  it("enforces player rest", () => { const result = generateSchedule({ matches: [match("m1", ["a","b","c","d"]), match("m2", ["a","e","f","g"])], courts: [court("c1"), court("c2")], slotMinutes: 30, minimumRestMinutes: 30 }); expect(result.assignments[1].startsAt).toEqual(at(9,30)); });
  it("respects court blackouts", () => { const c = court("c1"); c.blackouts = [{ from: at(8), until: at(10) }]; const result = generateSchedule({ matches: [match("m1", ["a","b","c","d"])], courts: [c], slotMinutes: 30, minimumRestMinutes: 0 }); expect(result.assignments[0].startsAt).toEqual(at(10)); });
  it("preserves locked assignments", () => { const m = match("m1", ["a","b","c","d"]); m.locked = { matchId: "m1", courtId: "c1", startsAt: at(12), endsAt: at(13), locked: true }; const result = generateSchedule({ matches: [m], courts: [court("c1")], slotMinutes: 30, minimumRestMinutes: 0 }); expect(result.assignments[0]).toEqual(m.locked); });
  it("explains unsatisfied constraints", () => { const m = match("m1", ["a","b","c","d"]); m.latestFinish = at(8,30); const result = generateSchedule({ matches: [m], courts: [court("c1")], slotMinutes: 30, minimumRestMinutes: 0 }); expect(result.assignments).toHaveLength(0); expect(result.conflicts[0].code).toBe("NO_SLOT"); });
  it("is deterministic", () => { const input = { matches: [match("b", ["e","f","g","h"]), match("a", ["a","b","c","d"])], courts: [court("c2"), court("c1")], slotMinutes: 30, minimumRestMinutes: 0 }; expect(generateSchedule(input)).toEqual(generateSchedule(input)); });
});
