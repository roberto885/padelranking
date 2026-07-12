import{describe,expect,it}from"vitest";
import{generateSingleElimination}from"./single-elimination";
const entries=(n:number)=>Array.from({length:n},(_,i)=>({id:`T${i+1}`}));
describe("single-elimination bracket",()=>{
  it("creates a complete power-of-two bracket",()=>{const nodes=generateSingleElimination({entries:entries(8)});expect(nodes).toHaveLength(7);expect(nodes.filter(n=>n.round===1)).toHaveLength(4);expect(nodes.at(-1)?.id).toBe("r3-m1");});
  it("adds byes for non-power-of-two fields",()=>{const first=generateSingleElimination({entries:entries(6)}).filter(n=>n.round===1);expect(first).toHaveLength(4);expect(first.flatMap(n=>[n.entry1,n.entry2]).filter(Boolean)).toHaveLength(6);});
  it("places top seeds in protected opposite halves",()=>{const seeded=[{id:"S1",seed:1},{id:"S2",seed:2},...entries(6)];const first=generateSingleElimination({entries:seeded}).filter(n=>n.round===1);const p1=first.findIndex(n=>n.entry1==="S1"||n.entry2==="S1"),p2=first.findIndex(n=>n.entry1==="S2"||n.entry2==="S2");expect(Math.floor(p1/2)).not.toBe(Math.floor(p2/2));});
  it("creates an optional third-place node from semifinal losers",()=>{const node=generateSingleElimination({entries:entries(8),thirdPlace:true}).find(n=>n.thirdPlace);expect(node?.source1).toBe("r2-m1");expect(node?.source2).toBe("r2-m2");});
  it("is deterministic for unseeded entries",()=>{const input={entries:[...entries(8)].reverse()};expect(generateSingleElimination(input)).toEqual(generateSingleElimination(input));});
  it("validates entries and seeds",()=>{expect(()=>generateSingleElimination({entries:[{id:"A"}]})).toThrow("AT_LEAST_TWO_ENTRIES_REQUIRED");expect(()=>generateSingleElimination({entries:[{id:"A",seed:1},{id:"B",seed:1}]})).toThrow("INVALID_SEEDS");});
});
