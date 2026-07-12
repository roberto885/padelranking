import { describe, expect, it } from "vitest";
import { rankStandings, type Criterion, type EntrySeed, type StandingMatch } from "./tiebreak";

const entries = (ids: string[]): EntrySeed[] => ids.map((id, drawSeed) => ({ id, name: id, walkovers: 0, drawSeed }));
const criteria: Criterion[] = ["match_points", "head_to_head", "set_difference", "game_difference", "stable_draw"];
const match = (id: string, a: string, b: string, winner: string, gamesA = 12, gamesB = 8): StandingMatch => ({ id, a, b, winner, setsA: winner === a ? 2 : 0, setsB: winner === b ? 2 : 0, gamesA, gamesB });

describe("tie-break standings", () => {
  it("resolves a two-way tie by head-to-head", () => { const result = rankStandings(entries(["A", "B", "C"]), [match("1", "A", "B", "A"), match("2", "A", "C", "C"), match("3", "B", "C", "B")], criteria); expect(result.map(x => x.id)).toEqual(["A", "B", "C"]); expect(result[0].explanation.join(" ")).toContain("enfrentamiento directo"); });
  it("resolves a circular three-way tie using the mini-table differential", () => { const games: StandingMatch[] = [match("1", "A", "B", "A", 12, 2), match("2", "B", "C", "B", 12, 8), match("3", "C", "A", "C", 12, 10)]; const result = rankStandings(entries(["A", "B", "C"]), games, criteria); expect(result.map(x => x.id)).toEqual(["A", "C", "B"]); });
  it("handles unequal matches played without percentages when policy uses points", () => { const result = rankStandings(entries(["A", "B", "C"]), [match("1", "A", "B", "A"), match("2", "A", "C", "A")], criteria); expect(result[0].id).toBe("A"); expect(result[0].played).toBe(2); });
  it("ignores removed results", () => { const removed = { ...match("1", "A", "B", "B"), excluded: true }; const result = rankStandings(entries(["A", "B"]), [removed], criteria); expect(result[0].id).toBe("A"); expect(result.every(x => x.played === 0)).toBe(true); });
  it("uses stable draw as deterministic final fallback", () => { const first = rankStandings(entries(["B", "A"]), [], ["match_points", "stable_draw"]); const second = rankStandings(entries(["B", "A"]), [], ["match_points", "stable_draw"]); expect(first).toEqual(second); expect(first.map(x => x.id)).toEqual(["B", "A"]); });
  it("requires an explicit deterministic final criterion", () => expect(() => rankStandings(entries(["A", "B"]), [], ["match_points"])).toThrow("DETERMINISTIC_FINAL_CRITERION_REQUIRED"));
});
