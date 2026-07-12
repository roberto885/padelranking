import { describe, expect, it } from "vitest";
import { calculateDoubles, isProvisional, type Formula, type RatedPlayer } from "./glicko2";

const formula: Formula = { id: "glicko2-v1", tau: 0.5, competitionWeight: 1, repeatFactor: 1, provisionalMatches: 10, floor: 500, ceiling: 3000 };
const player = (playerId: string, value = 1500, deviation = 200, matches = 5): RatedPlayer => ({ playerId, rating: { value, deviation, volatility: 0.06, matches } });

describe("doubles Glicko-2", () => {
  it("produces equal and opposite-direction changes for equal teams", () => { const result = calculateDoubles({ team1: [player("a"), player("b")], team2: [player("c"), player("d")], winningTeam: 1, formula }); expect(result.changes.slice(0, 2).every(c => c.delta > 0)).toBe(true); expect(result.changes.slice(2).every(c => c.delta < 0)).toBe(true); expect(result.changes[0].expectedWinProbability).toBeCloseTo(0.5); });
  it("rewards an upset more than an expected win", () => { const upset = calculateDoubles({ team1: [player("a", 1300), player("b", 1300)], team2: [player("c", 1800), player("d", 1800)], winningTeam: 1, formula }); const expectedWin = calculateDoubles({ team1: [player("a", 1800), player("b", 1800)], team2: [player("c", 1300), player("d", 1300)], winningTeam: 1, formula }); expect(upset.changes[0].delta).toBeGreaterThan(expectedWin.changes[0].delta); });
  it("dampens repeated-opponent matches", () => { const normal = calculateDoubles({ team1: [player("a"), player("b")], team2: [player("c"), player("d")], winningTeam: 1, formula }); const repeat = calculateDoubles({ team1: [player("a"), player("b")], team2: [player("c"), player("d")], winningTeam: 1, formula: { ...formula, repeatFactor: 0.25 } }); expect(repeat.changes[0].delta).toBeLessThan(normal.changes[0].delta); });
  it("is deterministic and records the formula version", () => { const input = { team1: [player("a"), player("b")], team2: [player("c"), player("d")], winningTeam: 2 as const, formula }; expect(calculateDoubles(input)).toEqual(calculateDoubles(input)); expect(calculateDoubles(input).formulaId).toBe("glicko2-v1"); });
  it("marks new players provisional", () => { expect(isProvisional(player("a", 1500, 350, 9).rating, formula)).toBe(true); expect(isProvisional(player("a", 1500, 100, 10).rating, formula)).toBe(false); });
  it("enforces rating floors and ceilings", () => { const result = calculateDoubles({ team1: [player("a", 2999, 350), player("b", 2999, 350)], team2: [player("c", 500, 350), player("d", 500, 350)], winningTeam: 1, formula }); expect(result.changes[0].after.value).toBeLessThanOrEqual(3000); expect(result.changes[2].after.value).toBeGreaterThanOrEqual(500); });
});
