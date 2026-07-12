import { afterAll, beforeAll, describe, expect, it } from "vitest";
import postgres from "postgres";
import { createClubApplication } from "./postgres-repository";

const url = process.env.DATABASE_URL;
const suite = describe.skipIf(!url);

suite("PostgreSQL club applications", () => {
  let sql: ReturnType<typeof postgres>;
  beforeAll(() => { sql = postgres(url!, { max: 1 }); });
  afterAll(async () => { await sql.end(); });

  it("creates application and profile atomically and prevents duplicates", async () => {
    const userId = crypto.randomUUID(), clubId = crypto.randomUUID();
    await sql`insert into users(id,email) values(${userId},${`u-${userId}@example.com`})`;
    await sql`insert into clubs(id,name,slug) values(${clubId},'Test',${`club-${clubId}`})`;
    const input = { id: crypto.randomUUID(), profileId: crypto.randomUUID(), clubId, userId, fullName: "Test Player", preferredLocale: "es-MX" as const, selfAssessedLevel: "Intermedio", now: new Date() };
    try {
      await createClubApplication(input, sql);
      const profiles = await sql<{ full_name: string }[]>`select full_name from player_profiles where club_id=${clubId} and user_id=${userId}`;
      expect(profiles[0].full_name).toBe("Test Player");
      await expect(createClubApplication({ ...input, id: crypto.randomUUID(), profileId: crypto.randomUUID() }, sql)).rejects.toThrow("ACTIVE_APPLICATION_EXISTS");
    } finally {
      await sql`delete from player_profiles where club_id=${clubId}`;
      await sql`delete from club_applications where club_id=${clubId}`;
      await sql`delete from clubs where id=${clubId}`;
      await sql`delete from users where id=${userId}`;
    }
  });
});
