import {describe,expect,it} from "vitest";
import {generateMexicanoRound,type MexicanoStanding} from "./mexicano";
const standings=(n:number):MexicanoStanding[]=>Array.from({length:n},(_,i)=>({playerId:`P${i+1}`,points:100-i*2,difference:10-i,seed:i+1}));

describe("Mexicano round generator",()=>{
  it("places the four leaders on championship court",()=>{const result=generateMexicanoRound({standings:standings(8),courts:2,history:[]});expect(result.courts[0].championship).toBe(true);expect(new Set([...result.courts[0].team1,...result.courts[0].team2])).toEqual(new Set(["P1","P2","P3","P4"]));});
  it("uses difference then seed for deterministic ties",()=>{const tied=standings(4).map(x=>({...x,points:10,difference:0})).reverse();const result=generateMexicanoRound({standings:tied,courts:1,history:[]});expect([...result.courts[0].team1,...result.courts[0].team2].sort()).toEqual(["P1","P2","P3","P4"]);});
  it("avoids repeated partners when an alternative exists",()=>{const first=generateMexicanoRound({standings:standings(4),courts:1,history:[]});const second=generateMexicanoRound({standings:standings(4),courts:1,history:[first.courts[0]]});const firstPairs=[first.courts[0].team1.sort().join(":"),first.courts[0].team2.sort().join(":")];const secondPairs=[second.courts[0].team1.sort().join(":"),second.courts[0].team2.sort().join(":")];expect(secondPairs.some(p=>firstPairs.includes(p))).toBe(false);});
  it("rests players below active court capacity",()=>{const result=generateMexicanoRound({standings:standings(10),courts:2,history:[]});expect(result.courts).toHaveLength(2);expect(result.resting).toEqual(["P9","P10"]);});
  it("is deterministic",()=>{const input={standings:standings(8),courts:2,history:[]};expect(generateMexicanoRound(input)).toEqual(generateMexicanoRound(input));});
  it("validates player and court counts",()=>{expect(()=>generateMexicanoRound({standings:standings(3),courts:1,history:[]})).toThrow("AT_LEAST_FOUR_PLAYERS_REQUIRED");expect(()=>generateMexicanoRound({standings:standings(4),courts:0,history:[]})).toThrow("AT_LEAST_ONE_COURT_REQUIRED");});
});
