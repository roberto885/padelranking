import { describe, expect, it } from "vitest";
import { generateAmericano } from "./americano";
const players=(n:number)=>Array.from({length:n},(_,i)=>({id:`P${i+1}`,seed:i+1}));
const pairs=(rounds:ReturnType<typeof generateAmericano>)=>rounds.flatMap(r=>r.matches.flatMap(m=>[[...m.team1].sort().join(":"),[...m.team2].sort().join(":")]));

describe("Americano generator",()=>{
  it("uses every available court and player for divisible fields",()=>{const result=generateAmericano({players:players(8),courts:2,rounds:4});expect(result.every(r=>r.matches.length===2&&r.resting.length===0)).toBe(true);});
  it("minimizes repeated partners",()=>{const result=generateAmericano({players:players(8),courts:2,rounds:3});const all=pairs(result);expect(new Set(all).size).toBe(all.length);});
  it("distributes rests fairly for uneven counts",()=>{const result=generateAmericano({players:players(10),courts:2,rounds:5});const counts=new Map<string,number>();result.flatMap(r=>r.resting).forEach(p=>counts.set(p,(counts.get(p)??0)+1));const values=[...counts.values()];expect(Math.max(...values)-Math.min(...values)).toBeLessThanOrEqual(1);expect(result.every(r=>r.resting.length===2)).toBe(true);});
  it("limits play to configured court capacity",()=>{const result=generateAmericano({players:players(12),courts:2,rounds:2});expect(result.every(r=>r.matches.length===2&&r.resting.length===4)).toBe(true);});
  it("is deterministic",()=>{const input={players:players(9),courts:2,rounds:5};expect(generateAmericano(input)).toEqual(generateAmericano(input));});
  it("validates configuration",()=>{expect(()=>generateAmericano({players:players(3),courts:1,rounds:1})).toThrow("AT_LEAST_FOUR_PLAYERS_REQUIRED");expect(()=>generateAmericano({players:players(4),courts:0,rounds:1})).toThrow("INVALID_AMERICANO_CONFIGURATION");});
});
