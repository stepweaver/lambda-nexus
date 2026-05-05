import { Pool } from "pg";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const expectedColumns = [
  "id",
  "source",
  "entry_type",
  "raw_text",
  "normalized_text",
  "status",
  "priority",
  "entry_date",
  "telegram_user_id",
  "telegram_chat_id",
  "telegram_message_id",
  "telegram_username",
  "telegram_first_name",
  "telegram_message_date",
  "metadata",
  "created_at",
  "updated_at",
];

function classifyError(error) {
  if (!process.env.DATABASE_URL) {
    return "DATABASE_URL is missing.";
  }

  const code = error?.code;
  const message = error instanceof Error ? error.message : String(error);

  if (code === "3D000") {
    return "Database does not exist. Check the local database name in DATABASE_URL.";
  }

  if (code === "28P01") {
    return "Database authentication failed. Check the local username/password.";
  }

  if (code === "42P01") {
    return "cerebro_entries table is missing.";
  }

  if (code === "42703") {
    return "Column mismatch while checking cerebro_entries.";
  }

  if (
    [
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      "EAI_AGAIN",
      "08000",
      "08001",
      "08003",
      "08004",
      "08006",
      "08007",
    ].includes(code)
  ) {
    return "Database unreachable. Check that local Postgres is running and DATABASE_URL points to local/dev.";
  }

  if (/ssl|tls|certificate/i.test(message)) {
    return "SSL setting problem. For local self-signed TLS only, set PGSSL_ALLOW_SELF_SIGNED=true.";
  }

  return "Database check failed.";
}

async function main() {
  const dataSource = process.env.CEREBRO_DATA_SOURCE ?? "mock";

  console.log(`CEREBRO_DATA_SOURCE=${dataSource}`);

  if (dataSource !== "postgres") {
    console.log("Mock mode selected. Set CEREBRO_DATA_SOURCE=postgres to check Postgres.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSL_ALLOW_SELF_SIGNED === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    await pool.query("SELECT 1");
    console.log("Connection: ok");

    const tableResult = await pool.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'cerebro_entries'
        ) AS exists
      `,
    );

    if (!tableResult.rows[0]?.exists) {
      throw Object.assign(new Error("cerebro_entries table is missing."), {
        code: "42P01",
      });
    }

    console.log("Table cerebro_entries: ok");

    const columnResult = await pool.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'cerebro_entries'
      `,
    );

    const actualColumns = new Set(
      columnResult.rows.map((row) => String(row.column_name)),
    );
    const missingColumns = expectedColumns.filter(
      (column) => !actualColumns.has(column),
    );

    if (missingColumns.length > 0) {
      throw Object.assign(
        new Error(`Missing expected columns: ${missingColumns.join(", ")}`),
        { code: "42703" },
      );
    }

    console.log("Expected columns: ok");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  const codeText = error?.code ? ` code=${error.code}` : "";
  console.error(`Cerebro DB check failed:${codeText} ${classifyError(error)}`);

  if (error?.message && !/password|secret|postgres:\/\//i.test(error.message)) {
    console.error(error.message);
  }

  process.exitCode = 1;
});
