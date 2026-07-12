import{afterAll,beforeAll,describe,expect,it}from"vitest";import postgres from"postgres";import{signInWithGooglePostgres}from"./postgres-google";const url=process.env.DATABASE_URL;const suite=describe.skipIf(!url);
suite("PostgreSQL Google sign-in",()=>{let sql:ReturnType<typeof postgres>;beforeAll(()=>{sql=postgres(url!,{max:1})});afterAll(async()=>sql.end());
it("creates, links, and reuses accounts by verified subject",async()=>{const sub=`sub-${crypto.randomUUID()}`,email=`g-${crypto.randomUUID()}@e.com`;let userId:string|undefined;try{
const first=await signInWithGooglePostgres({sub,email,sessionId:crypto.randomUUID(),now:new Date()},sql);userId=first.userId;expect(first.rawSessionToken).toBeTruthy();
const again=await signInWithGooglePostgres({sub,email,sessionId:crypto.randomUUID(),now:new Date()},sql);expect(again.userId).toBe(first.userId);
const verified=await sql<{email_verified_at:Date|null}[]>`select email_verified_at from users where id=${first.userId}`;expect(verified[0].email_verified_at).not.toBeNull();
await expect(signInWithGooglePostgres({sub:`other-${sub}`,email,sessionId:crypto.randomUUID(),now:new Date()},sql)).rejects.toThrow("GOOGLE_ACCOUNT_MISMATCH");
const sessions=await sql<{count:string}[]>`select count(*) from sessions where user_id=${first.userId}`;expect(Number(sessions[0].count)).toBe(2);
}finally{if(userId){await sql`delete from sessions where user_id=${userId}`;await sql`delete from auth_accounts where user_id=${userId}`;await sql`delete from users where id=${userId}`;}}});
it("links an existing magic-link user by email",async()=>{const email=`m-${crypto.randomUUID()}@e.com`,userId=crypto.randomUUID(),sub=`sub-${crypto.randomUUID()}`;try{
await sql`insert into users(id,email) values(${userId},${email})`;
const result=await signInWithGooglePostgres({sub,email,sessionId:crypto.randomUUID(),now:new Date()},sql);expect(result.userId).toBe(userId);
const accounts=await sql<{provider_account_id:string}[]>`select provider_account_id from auth_accounts where user_id=${userId} and provider='google'`;expect(accounts[0].provider_account_id).toBe(sub);
}finally{await sql`delete from sessions where user_id=${userId}`;await sql`delete from auth_accounts where user_id=${userId}`;await sql`delete from users where id=${userId}`;}});
});
