import "server-only";

import { Pool, type QueryResultRow } from "pg";
import {
  createMockEntry,
  deleteMockEntry,
  listMockEntries,
  listMockOpenTasks,
  listMockTodayEntries,
  markMockTaskDone,
  updateMockEntry,
} from "./mock";
import type {
  CerebroEntry,
  CreateEntryInput,
  EntryFilters,
  EntryType,
  UpdateEntryInput,
} from "./types";

let pool: Pool | null = null;

const POSTGRES_ERROR_HINTS: Record<string, string> = {
  "3D000": "Database does not exist. Check the database name in DATABASE_URL.",
  "28P01": "Database authentication failed. Check the local username/password.",
  "42P01": "Table missing. Expected a cerebro_entries table in the configured database.",
  "42703": "Column mismatch. The query references a column missing from cerebro_entries.",
};

const CONNECTION_ERROR_CODES = new Set([
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
]);

const getConfiguredDataSource = () => process.env.CEREBRO_DATA_SOURCE ?? "mock";

const shouldUsePostgres = () => getConfiguredDataSource() === "postgres";

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const code = "code" in error ? error.code : undefined;
  return typeof code === "string" ? code : undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function buildPostgresDiagnostic(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  if (!process.env.DATABASE_URL) {
    return "DATABASE_URL is missing while CEREBRO_DATA_SOURCE=postgres.";
  }

  if (code && POSTGRES_ERROR_HINTS[code]) {
    return POSTGRES_ERROR_HINTS[code];
  }

  if (code && CONNECTION_ERROR_CODES.has(code)) {
    return "Database unreachable. Check that local Postgres is running and DATABASE_URL points to the local/dev database.";
  }

  if (/ssl|tls|certificate/i.test(message)) {
    return "SSL setting problem. For local self-signed TLS only, set PGSSL_ALLOW_SELF_SIGNED=true; otherwise remove SSL requirements from the local DATABASE_URL.";
  }

  return "Postgres query failed. Check local database connectivity and the cerebro_entries table shape.";
}

function wrapPostgresError(error: unknown) {
  if (error instanceof Error && ["Entry not found", "Task not found"].includes(error.message)) {
    return error;
  }

  const code = getErrorCode(error);
  const codeText = code ? ` code=${code}` : "";
  const diagnostic = buildPostgresDiagnostic(error);

  return new Error(`Cerebro Postgres error:${codeText} ${diagnostic}`, {
    cause: error,
  });
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Cerebro Postgres error: DATABASE_URL is missing while CEREBRO_DATA_SOURCE=postgres.",
    );
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.PGSSL_ALLOW_SELF_SIGNED === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  return pool;
}

const entrySelect = `
  id::text,
  source,
  entry_type,
  raw_text,
  normalized_text,
  status,
  priority,
  entry_date::text,
  telegram_user_id::text,
  telegram_chat_id::text,
  telegram_message_id::text,
  telegram_username,
  telegram_first_name,
  telegram_message_date::text,
  metadata,
  created_at::text,
  updated_at::text
`;

function normalizeEntry(row: QueryResultRow): CerebroEntry {
  return {
    id: String(row.id),
    source: row.source ?? null,
    entry_type: row.entry_type as EntryType,
    raw_text: String(row.raw_text ?? ""),
    normalized_text: row.normalized_text ?? null,
    status: row.status ?? null,
    priority: row.priority ?? null,
    entry_date: String(row.entry_date),
    telegram_user_id: row.telegram_user_id ?? null,
    telegram_chat_id: row.telegram_chat_id ?? null,
    telegram_message_id: row.telegram_message_id ?? null,
    telegram_username: row.telegram_username ?? null,
    telegram_first_name: row.telegram_first_name ?? null,
    telegram_message_date: row.telegram_message_date ?? null,
    metadata: row.metadata ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function getCerebroMode() {
  return shouldUsePostgres() ? "postgres" : "mock";
}

export async function listEntries(filters: EntryFilters = {}) {
  if (!shouldUsePostgres()) {
    return listMockEntries(filters);
  }

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.entryType) {
    values.push(filters.entryType);
    conditions.push(`entry_type = $${values.length}`);
  }

  if (filters.query) {
    values.push(`%${filters.query}%`);
    conditions.push(
      `(raw_text ILIKE $${values.length} OR normalized_text ILIKE $${values.length})`,
    );
  }

  values.push(filters.limit ?? 50);
  const limitParam = `$${values.length}`;
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  try {
    const result = await getPool().query(
      `
        SELECT ${entrySelect}
        FROM cerebro_entries
        ${where}
        ORDER BY created_at DESC
        LIMIT ${limitParam}
      `,
      values,
    );

    return result.rows.map(normalizeEntry);
  } catch (error) {
    throw wrapPostgresError(error);
  }
}

export async function listTodayEntries() {
  if (!shouldUsePostgres()) {
    return listMockTodayEntries();
  }

  try {
    const result = await getPool().query(`
      SELECT ${entrySelect}
      FROM cerebro_entries
      WHERE entry_date = CURRENT_DATE
      ORDER BY created_at DESC
    `);

    return result.rows.map(normalizeEntry);
  } catch (error) {
    throw wrapPostgresError(error);
  }
}

export async function listOpenTasks() {
  if (!shouldUsePostgres()) {
    return listMockOpenTasks();
  }

  try {
    const result = await getPool().query(`
      SELECT ${entrySelect}
      FROM cerebro_entries
      WHERE entry_type = 'task' AND COALESCE(status, 'open') <> 'done'
      ORDER BY COALESCE(priority, 0) DESC, created_at DESC
    `);

    return result.rows.map(normalizeEntry);
  } catch (error) {
    throw wrapPostgresError(error);
  }
}

export async function createEntry(input: CreateEntryInput) {
  if (!shouldUsePostgres()) {
    return createMockEntry(input);
  }

  try {
    const result = await getPool().query(
      `
        INSERT INTO cerebro_entries (
          source,
          entry_type,
          raw_text,
          normalized_text,
          status,
          priority,
          entry_date,
          metadata
        )
        VALUES ('manual', $1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7::jsonb)
        RETURNING ${entrySelect}
      `,
      [
        input.entry_type,
        input.raw_text,
        input.normalized_text || null,
        input.status || (input.entry_type === "task" ? "open" : "captured"),
        input.priority ?? null,
        input.entry_date ?? null,
        JSON.stringify({ createdFrom: "lambda-nexus" }),
      ],
    );

    return normalizeEntry(result.rows[0]);
  } catch (error) {
    throw wrapPostgresError(error);
  }
}

export async function updateEntry(input: UpdateEntryInput) {
  if (!shouldUsePostgres()) {
    return updateMockEntry(input);
  }

  try {
    const result = await getPool().query(
      `
        UPDATE cerebro_entries
        SET
          entry_type = $2,
          raw_text = $3,
          normalized_text = $4,
          status = $5,
          priority = $6,
          entry_date = $7::date,
          updated_at = NOW()
        WHERE id::text = $1
        RETURNING ${entrySelect}
      `,
      [
        input.id,
        input.entry_type,
        input.raw_text,
        input.normalized_text || null,
        input.status || (input.entry_type === "task" ? "open" : "captured"),
        input.priority ?? null,
        input.entry_date,
      ],
    );

    if (!result.rows[0]) {
      throw new Error("Entry not found");
    }

    return normalizeEntry(result.rows[0]);
  } catch (error) {
    throw wrapPostgresError(error);
  }
}

export async function deleteEntry(id: string) {
  if (!shouldUsePostgres()) {
    return deleteMockEntry(id);
  }

  try {
    await getPool().query("DELETE FROM cerebro_entries WHERE id::text = $1", [id]);
  } catch (error) {
    throw wrapPostgresError(error);
  }
}

export async function markTaskDone(id: string) {
  if (!shouldUsePostgres()) {
    return markMockTaskDone(id);
  }

  try {
    const result = await getPool().query(
      `
        UPDATE cerebro_entries
        SET status = 'done', updated_at = NOW()
        WHERE id::text = $1 AND entry_type = 'task'
        RETURNING ${entrySelect}
      `,
      [id],
    );

    if (!result.rows[0]) {
      throw new Error("Task not found");
    }

    return normalizeEntry(result.rows[0]);
  } catch (error) {
    throw wrapPostgresError(error);
  }
}
