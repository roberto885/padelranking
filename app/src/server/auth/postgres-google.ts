import{database}from"../db/client";import{issueSession}from"./tokens";
export async function signInWithGooglePostgres(input:{sub:string;email:string;sessionId:string;now:Date},sql=database()){const sessionToken=issueSession({id:input.sessionId,userId:"pending",now:input.now});return sql.begin(async tx=>{
const linked=await tx<{user_id:string}[]>`select user_id from auth_accounts where provider='google' and provider_account_id=${input.sub}`;let userId=linked[0]?.user_id;
if(!userId){const users=await tx<{id:string}[]>`select id from users where email=${input.email} for update`;userId=users[0]?.id;if(!userId){userId=crypto.randomUUID();await tx`insert into users(id,email,email_verified_at) values(${userId},${input.email},${input.now})`}else await tx`update users set email_verified_at=coalesce(email_verified_at,${input.now}),updated_at=${input.now} where id=${userId}`;
const existing=await tx<{provider_account_id:string}[]>`select provider_account_id from auth_accounts where provider='google' and user_id=${userId}`;if(existing.length&&existing[0].provider_account_id!==input.sub)throw new Error("GOOGLE_ACCOUNT_MISMATCH");
if(!existing.length)await tx`insert into auth_accounts(user_id,provider,provider_account_id) values(${userId},'google',${input.sub})`}
const session={...sessionToken.session,userId};await tx`insert into sessions(id,user_id,token_hash,expires_at,last_seen_at) values(${session.id},${userId},${session.tokenHash},${session.expiresAt},${session.lastSeenAt})`;
return{rawSessionToken:sessionToken.rawToken,sessionId:session.id,userId,expiresAt:session.expiresAt}});}
