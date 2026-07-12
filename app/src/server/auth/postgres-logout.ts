import{hashToken}from"./tokens";import{database}from"../db/client";
export async function revokeSessionPostgres(rawToken:string,now:Date,sql=database()){const rows=await sql<{id:string}[]>`update sessions set revoked_at=coalesce(revoked_at,${now}) where token_hash=${hashToken(rawToken)} returning id`;return{revoked:rows.length>0}}
