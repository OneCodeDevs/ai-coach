import "server-only";

import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH);
  }
  return path.join(process.cwd(), "data", "coach.db");
}

const dbPath = resolveDbPath();
mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

function applyMigrations() {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY NOT NULL,
      applied_at integer NOT NULL
    )
  `);

  const files = readdirSync(migrationsFolder)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const applied = new Set(
    sqlite
      .prepare("SELECT id FROM schema_migrations")
      .all()
      .map((row) => (row as { id: string }).id),
  );

  const insert = sqlite.prepare(
    "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(path.join(migrationsFolder, file), "utf8");
    sqlite.exec(sql);
    insert.run(file, Math.floor(Date.now() / 1000));
  }
}

applyMigrations();

export const db = drizzle(sqlite, { schema });
export { sqlite };
