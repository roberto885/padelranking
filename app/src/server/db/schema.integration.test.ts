import { afterAll, beforeAll, describe, expect, it } from "vitest";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
const suite = describe.skipIf(!url);

suite("PostgreSQL migrated schema", () => {
  let sql: ReturnType<typeof postgres>;
  beforeAll(() => { sql = postgres(url!, { max: 1 }); });
  afterAll(async () => { await sql.end(); });

  it("contains all core workflow tables", async () => {
    const expected = ["clubs", "player_profiles", "matches", "score_submissions", "rating_transactions", "events", "event_categories", "schedule_versions", "notification_outbox", "sessions"];
    const rows = await sql<{ table_name: string }[]>`select table_name from information_schema.tables where table_schema = 'public'`;
    const existing = new Set(rows.map(row => row.table_name));
    expect(expected.filter(name => !existing.has(name))).toEqual([]);
  });

  it("enforces club slug uniqueness", async () => {
    const slug = `test-${crypto.randomUUID()}`;
    await sql.begin(async tx => {
      await tx`insert into clubs(name, slug) values('A', ${slug})`;
      await expect(tx`insert into clubs(name, slug) values('B', ${slug})`).rejects.toMatchObject({ code: "23505" });
      throw new Error("ROLLBACK_TEST");
    }).catch(error => { if (error.message !== "ROLLBACK_TEST") throw error; });
  });

  it("enforces one rating transaction per player and match", async () => {
    const indexes = await sql<{ indexname: string }[]>`select indexname from pg_indexes where schemaname = 'public' and indexname = 'rating_transaction_match_player_unique'`;
    expect(indexes).toHaveLength(1);
  });
});
