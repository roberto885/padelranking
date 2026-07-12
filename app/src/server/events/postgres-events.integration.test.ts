import{afterAll,beforeAll,describe,expect,it}from"vitest";import postgres from"postgres";import{createEventPostgres,listClubEventsPostgres}from"./postgres-events";const url=process.env.DATABASE_URL;const suite=describe.skipIf(!url);
suite("PostgreSQL events",()=>{let sql:ReturnType<typeof postgres>;beforeAll(()=>{sql=postgres(url!,{max:1})});afterAll(async()=>sql.end());
it("creates drafts with unique slugs, audits them, and enforces roles",async()=>{const ownerId=crypto.randomUUID(),outsiderId=crypto.randomUUID(),clubId=crypto.randomUUID();const base={clubId,actorUserId:ownerId,name:"Torneo Ñandú",date:"2099-01-15",startTime:"18:00",endTime:"22:00",format:"americano" as const,capacity:16,courts:4,minutesPerRound:20,now:new Date()};try{
await sql`insert into users(id,email) values(${ownerId},${`${ownerId}@e.com`}),(${outsiderId},${`${outsiderId}@e.com`})`;
await sql`insert into clubs(id,name,slug,timezone) values(${clubId},'Test Club',${`club-${clubId}`},'America/Matamoros')`;
await sql`insert into role_assignments(club_id,user_id,role) values(${clubId},${ownerId},'owner')`;
const first=await createEventPostgres(base,sql);expect(first.slug).toBe("torneo-nandu");expect(first.startsAt.toISOString()).toBe("2099-01-16T00:00:00.000Z");
const second=await createEventPostgres(base,sql);expect(second.slug).toBe("torneo-nandu-2");
await expect(createEventPostgres({...base,actorUserId:outsiderId},sql)).rejects.toThrow("FORBIDDEN");
await expect(createEventPostgres({...base,date:"2001-01-01"},sql)).rejects.toThrow("EVENT_IN_PAST");
const audits=await sql<{action:string}[]>`select action from audit_logs where club_id=${clubId} and target_type='event'`;expect(audits).toHaveLength(2);
const list=await listClubEventsPostgres({clubId,actorUserId:ownerId},sql);expect(list.map(e=>e.slug).sort()).toEqual(["torneo-nandu","torneo-nandu-2"]);expect(list[0].format).toBe("americano");
await expect(listClubEventsPostgres({clubId,actorUserId:outsiderId},sql)).rejects.toThrow("FORBIDDEN");
}finally{await sql`delete from audit_logs where club_id=${clubId}`;await sql`delete from event_categories where club_id=${clubId}`;await sql`delete from events where club_id=${clubId}`;await sql`delete from role_assignments where club_id=${clubId}`;await sql`delete from clubs where id=${clubId}`;await sql`delete from users where id in (${ownerId},${outsiderId})`;}},30_000);});
