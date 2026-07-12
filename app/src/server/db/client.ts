import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_REQUIRED");
  client ??= postgres(url, { max: 10, idle_timeout: 20, connect_timeout: 10, prepare: false });
  return client;
}

export async function closeDatabase() {
  if (client) await client.end({ timeout: 5 });
  client = undefined;
}
