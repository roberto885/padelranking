import { describe, expect, it } from "vitest";
import { generateRoundRobin } from "./round-robin";

const entries = (count: number) => Array.from({ length: count }, (_, i) => ({ id: `T${i + 1}`, seed: i + 1 }));
const pair = (a: string, b: string) => [a, b].sort().join(":");

describe("round-robin generator", () => {
  it("creates every pairing exactly once for an even field", () => { const rounds = generateRoundRobin(entries(6)); const matches = rounds.flatMap(r => r.matches); expect(rounds).toHaveLength(5); expect(matches).toHaveLength(15); expect(new Set(matches.map(m => pair(m.home, m.away))).size).toBe(15); expect(rounds.every(r => new Set(r.matches.flatMap(m => [m.home, m.away])).size === 6)).toBe(true); });
  it("assigns one rotating bye per round for an odd field", () => { const rounds = generateRoundRobin(entries(5)); expect(rounds).toHaveLength(5); expect(rounds.every(r => r.matches.length === 2 && r.bye)).toBe(true); expect(new Set(rounds.map(r => r.bye)).size).toBe(5); });
  it("creates a mirrored return leg", () => { const rounds = generateRoundRobin(entries(4), true); const matches = rounds.flatMap(r => r.matches); expect(rounds).toHaveLength(6); expect(matches).toHaveLength(12); for (const first of matches.filter(m => m.leg === 1)) expect(matches.some(m => m.leg === 2 && m.home === first.away && m.away === first.home)).toBe(true); });
  it("is deterministic regardless of input order", () => { const normal = generateRoundRobin(entries(4)); expect(generateRoundRobin([...entries(4)].reverse())).toEqual(normal); });
  it("rejects duplicate and undersized fields", () => { expect(() => generateRoundRobin([{ id: "A", seed: 1 }])).toThrow("AT_LEAST_TWO_ENTRIES_REQUIRED"); expect(() => generateRoundRobin([{ id: "A", seed: 1 }, { id: "A", seed: 2 }])).toThrow("DUPLICATE_ENTRY"); });
});
