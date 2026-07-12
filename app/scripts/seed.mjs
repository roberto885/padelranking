import postgres from "postgres";
import { randomUUID } from "node:crypto";

const required = ["DATABASE_URL", "SEED_OWNER_EMAIL", "SEED_CLUB_NAME", "SEED_CLUB_SLUG"];
for (const key of required) if (!process.env[key]) throw new Error(`${key} is required`);
if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") throw new Error("Production seed requires ALLOW_PRODUCTION_SEED=true");

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const ownerEmail = process.env.SEED_OWNER_EMAIL.trim().toLowerCase();
const clubSlug = process.env.SEED_CLUB_SLUG.trim().toLowerCase();
const timezone = process.env.SEED_TIMEZONE || "America/Matamoros";
try {
  const result = await sql.begin(async tx => {
    let [user] = await tx`select id from users where email=${ownerEmail}`;
    if (!user) { user = { id: randomUUID() }; await tx`insert into users(id,email,email_verified_at,preferred_locale) values(${user.id},${ownerEmail},now(),'es-MX')`; }
    let [club] = await tx`select id from clubs where slug=${clubSlug}`;
    if (!club) { club = { id: randomUUID() }; await tx`insert into clubs(id,name,slug,currency,timezone,default_locale) values(${club.id},${process.env.SEED_CLUB_NAME},${clubSlug},'MXN',${timezone},'es-MX')`; }
    await tx`insert into club_applications(club_id,user_id,status,reviewed_at) values(${club.id},${user.id},'approved',now()) on conflict(club_id,user_id) do update set status='approved',reviewed_at=now()`;
    await tx`insert into role_assignments(club_id,user_id,role,assigned_by) values(${club.id},${user.id},'owner',${user.id}) on conflict do nothing`;
    await tx`insert into player_profiles(club_id,user_id,kind,full_name,verified_level,rating,rating_deviation) values(${club.id},${user.id},'registered',${process.env.SEED_OWNER_NAME || "Club Owner"},'intermediate',1500,350) on conflict(club_id,user_id) do nothing`;
    let [location] = await tx`select id from club_locations where club_id=${club.id} and name='Club principal'`;
    if (!location) { location = { id: randomUUID() }; await tx`insert into club_locations(id,club_id,name,timezone) values(${location.id},${club.id},'Club principal',${timezone})`; }
    const levels = [["beginner","Principiante","Beginner",1,1100],["intermediate","Intermedio","Intermediate",2,1500],["advanced","Avanzado","Advanced",3,1900]];
    for (const [code,es,en,order,rating] of levels) await tx`insert into club_level_bands(club_id,code,label_es,label_en,display_order,initial_rating) values(${club.id},${code},${es},${en},${order},${rating}) on conflict(club_id,code) do update set label_es=excluded.label_es,label_en=excluded.label_en,display_order=excluded.display_order,initial_rating=excluded.initial_rating`;
    const courtCount = Number(process.env.SEED_COURT_COUNT || 10);
    for (let number=1;number<=courtCount;number++) await tx`insert into courts(club_id,location_id,name,environment) values(${club.id},${location.id},${`Cancha ${number}`},'outdoor') on conflict(club_id,location_id,name) do nothing`;
    return { clubId: club.id, ownerUserId: user.id, locationId: location.id };
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
} finally { await sql.end(); }
