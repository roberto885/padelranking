import{describe,expect,it}from"vitest";import{assertAdminStepUp,isStepUpFresh,STEP_UP_MAX_AGE_MINUTES}from"./step-up";
const now=new Date("2026-07-11T18:00:00Z");
describe("administrator step-up policy",()=>{
it("treats a recent verification as fresh and an old one as stale",()=>{expect(isStepUpFresh(new Date(now.getTime()-29*60_000),now)).toBe(true);expect(isStepUpFresh(new Date(now.getTime()-STEP_UP_MAX_AGE_MINUTES*60_000-1),now)).toBe(false);expect(isStepUpFresh(undefined,now)).toBe(false)});
it("requires enrollment before step-up",()=>{expect(()=>assertAdminStepUp({totpActive:false,now})).toThrow("TOTP_ENROLLMENT_REQUIRED");expect(()=>assertAdminStepUp({totpActive:false,stepUpVerifiedAt:now,now})).toThrow("TOTP_ENROLLMENT_REQUIRED")});
it("requires a fresh verification for sensitive actions",()=>{expect(()=>assertAdminStepUp({totpActive:true,now})).toThrow("STEP_UP_REQUIRED");expect(()=>assertAdminStepUp({totpActive:true,stepUpVerifiedAt:new Date(now.getTime()-31*60_000),now})).toThrow("STEP_UP_REQUIRED");expect(()=>assertAdminStepUp({totpActive:true,stepUpVerifiedAt:new Date(now.getTime()-5*60_000),now})).not.toThrow()});
it("honors a custom freshness window",()=>{expect(()=>assertAdminStepUp({totpActive:true,stepUpVerifiedAt:new Date(now.getTime()-10*60_000),now,maxAgeMinutes:5})).toThrow("STEP_UP_REQUIRED");expect(isStepUpFresh(new Date(now.getTime()-10*60_000),now,15)).toBe(true)});
});
