import{afterAll,beforeAll,describe,expect,it}from"vitest";import postgres from"postgres";import{hashToken}from"./tokens";import{totpCode,totpStep}from"./totp";import{activateTotp,beginTotpEnrollment,loadReviewGate,verifyTotpStepUp}from"./postgres-totp";const url=process.env.DATABASE_URL;const suite=describe.skipIf(!url);const authSecret="integration-authentication-secret-32ch";
suite("PostgreSQL TOTP step-up",()=>{let sql:ReturnType<typeof postgres>;beforeAll(()=>{sql=postgres(url!,{max:1})});afterAll(async()=>sql.end());
it("enrolls, activates, stamps step-up, and blocks replay",async()=>{const userId=crypto.randomUUID(),sessionId=crypto.randomUUID();try{
await sql`insert into users(id,email) values(${userId},${`${userId}@e.com`})`;await sql`insert into sessions(id,user_id,token_hash,expires_at,last_seen_at) values(${sessionId},${userId},${hashToken(`s-${sessionId}`)},${new Date(Date.now()+60_000)},now())`;
const now=new Date();const enrollment=await beginTotpEnrollment({userId,authSecret,now},sql);expect(enrollment.otpauthUri).toContain("otpauth://totp/");
const stored=await sql<{secret_box:string}[]>`select secret_box from user_totp_credentials where user_id=${userId}`;expect(stored[0].secret_box).not.toContain(enrollment.secret);
await expect(activateTotp({userId,sessionId,code:"000000",authSecret,now},sql)).rejects.toThrow("TOTP_CODE_INVALID");
const code=totpCode(enrollment.secret,totpStep(now));await activateTotp({userId,sessionId,code,authSecret,now},sql);
const sessions=await sql<{step_up_verified_at:Date|null}[]>`select step_up_verified_at from sessions where id=${sessionId}`;expect(sessions[0].step_up_verified_at).not.toBeNull();
await expect(beginTotpEnrollment({userId,authSecret,now},sql)).rejects.toThrow("TOTP_ALREADY_ACTIVE");
await expect(verifyTotpStepUp({userId,sessionId,code,authSecret,now},sql)).rejects.toThrow("TOTP_CODE_REPLAYED");
const later=new Date(now.getTime()+60_000),nextCode=totpCode(enrollment.secret,totpStep(later));expect((await verifyTotpStepUp({userId,sessionId,code:nextCode,authSecret,now:later},sql)).verifiedAt).toEqual(later);
expect(await loadReviewGate({userId,clubId:crypto.randomUUID()},sql)).toEqual({staff:false,totpActive:true});
}finally{await sql`delete from user_totp_credentials where user_id=${userId}`;await sql`delete from sessions where id=${sessionId}`;await sql`delete from users where id=${userId}`;}},30_000);});
