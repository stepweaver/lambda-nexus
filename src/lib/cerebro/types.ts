export const entryTypes = [
  "task",
  "note",
  "idea",
  "journal",
  "question",
  "capture",
] as const;

export type EntryType = (typeof entryTypes)[number];

export type EntryStatus = "open" | "done" | string;

export type CerebroEntry = {
  id: string;
  source: string | null;
  entry_type: EntryType;
  raw_text: string;
  normalized_text: string | null;
  status: EntryStatus | null;
  priority: number | null;
  entry_date: string;
  telegram_user_id: string | null;
  telegram_chat_id: string | null;
  telegram_message_id: string | null;
  telegram_username: string | null;
  telegram_first_name: string | null;
  telegram_message_date: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type EntryFilters = {
  entryType?: EntryType;
  query?: string;
  limit?: number;
};

export type CreateEntryInput = {
  entry_type: EntryType;
  raw_text: string;
  normalized_text?: string;
  status?: EntryStatus;
  priority?: number;
  entry_date?: string;
};

export type UpdateEntryInput = {
  id: string;
  entry_type: EntryType;
  raw_text: string;
  normalized_text?: string;
  status?: EntryStatus;
  priority?: number;
  entry_date: string;
};
