import{describe,expect,it}from"vitest";import{describeSeed,validateLevelBands,verifyAndSeed,type LevelBand}from"./level-seeding";
const bands:LevelBand[]=[{id:"beginner",label:"Principiante",order:1,initialRating:1100},{id:"intermediate",label:"Intermedio",order:2,initialRating:1500},{id:"advanced",label:"Avanzado",order:3,initialRating:1900}];
describe("verified level seeding",()=>{
it("seeds a provisional rating from the verified level",()=>{const result=verifyAndSeed({playerId:"p1",levelId:"intermediate",bands,currentMatches:0,reason:"Evaluación del entrenador",verifiedBy:"admin",now:new Date()});expect(result.rating).toMatchObject({value:1500,deviation:350,matches:0});expect(describeSeed(result,bands)).toContain("provisional");});
it("requires a reason",()=>expect(()=>verifyAndSeed({playerId:"p",levelId:"beginner",bands,currentMatches:0,reason:" ",verifiedBy:"a",now:new Date()})).toThrow("VERIFICATION_REASON_REQUIRED"));
it("prevents silent reseeding after match history exists",()=>expect(()=>verifyAndSeed({playerId:"p",levelId:"advanced",bands,currentMatches:2,reason:"Cambio",verifiedBy:"a",now:new Date()})).toThrow("MATCH_HISTORY_REQUIRES_RATING_RECALCULATION"));
it("requires contiguous ordered levels with increasing ratings",()=>{expect(validateLevelBands(bands).map(b=>b.id)).toEqual(["beginner","intermediate","advanced"]);expect(()=>validateLevelBands([{...bands[0],order:2},bands[1]])).toThrow();expect(()=>validateLevelBands([bands[0],{...bands[1],initialRating:1000}])).toThrow("LEVEL_RATINGS_MUST_INCREASE");});
it("rejects unknown levels",()=>expect(()=>verifyAndSeed({playerId:"p",levelId:"elite",bands,currentMatches:0,reason:"Test",verifiedBy:"a",now:new Date()})).toThrow("UNKNOWN_LEVEL"));
});
