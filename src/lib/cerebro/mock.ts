import "server-only";

import type {
  CerebroEntry,
  CreateEntryInput,
  EntryFilters,
  EntryType,
  UpdateEntryInput,
} from "./types";

const today = () => new Date().toISOString().slice(0, 10);

const now = () => new Date().toISOString();

const seedEntry = (
  id: string,
  entry_type: EntryType,
  raw_text: string,
  overrides: Partial<CerebroEntry> = {},
): CerebroEntry => ({
  id,
  source: "mock",
  entry_type,
  raw_text,
  normalized_text: null,
  status: entry_type === "task" ? "open" : "captured",
  priority: null,
  entry_date: today(),
  telegram_user_id: null,
  telegram_chat_id: null,
  telegram_message_id: null,
  telegram_username: null,
  telegram_first_name: null,
  telegram_message_date: null,
  metadata: { localOnly: true },
  created_at: now(),
  updated_at: now(),
  ...overrides,
});

let mockEntries: CerebroEntry[] = [
  seedEntry("mock-1", "task", "Confirm local Cerebro schema before connecting production."),
  seedEntry("mock-2", "note", "λnexus is the private UI/control layer for λstepweaver."),
  seedEntry("mock-3", "idea", "Add review queues after the capture flow feels stable."),
  seedEntry("mock-4", "question", "What fields does the Telegram bot always populate?"),
  seedEntry("mock-5", "journal", "First pass should stay boring and inspectable.", {
    entry_date: "2026-05-04",
  }),
];

const sortNewest = (entries: CerebroEntry[]) =>
  entries.toSorted((a, b) => b.created_at.localeCompare(a.created_at));

const matchesFilters = (entry: CerebroEntry, filters: EntryFilters) => {
  const normalizedQuery = filters.query?.trim().toLowerCase();

  if (filters.entryType && entry.entry_type !== filters.entryType) {
    return false;
  }

  if (!normalizedQuery) {
    return true;
  }

  const haystack = `${entry.raw_text} ${entry.normalized_text ?? ""}`.toLowerCase();
  return haystack.includes(normalizedQuery);
};

export async function listMockEntries(filters: EntryFilters = {}) {
  return sortNewest(mockEntries.filter((entry) => matchesFilters(entry, filters))).slice(
    0,
    filters.limit ?? 50,
  );
}

export async function listMockTodayEntries() {
  return sortNewest(mockEntries.filter((entry) => entry.entry_date === today()));
}

export async function listMockOpenTasks() {
  return sortNewest(
    mockEntries.filter(
      (entry) => entry.entry_type === "task" && (entry.status ?? "open") !== "done",
    ),
  );
}

export async function createMockEntry(input: CreateEntryInput) {
  const timestamp = now();
  const entry: CerebroEntry = {
    id: crypto.randomUUID(),
    source: "manual",
    entry_type: input.entry_type,
    raw_text: input.raw_text,
    normalized_text: input.normalized_text || null,
    status: input.status || (input.entry_type === "task" ? "open" : "captured"),
    priority: input.priority ?? null,
    entry_date: input.entry_date || today(),
    telegram_user_id: null,
    telegram_chat_id: null,
    telegram_message_id: null,
    telegram_username: null,
    telegram_first_name: null,
    telegram_message_date: null,
    metadata: { localOnly: true, createdFrom: "lambda-nexus" },
    created_at: timestamp,
    updated_at: timestamp,
  };

  mockEntries = [entry, ...mockEntries];
  return entry;
}

export async function updateMockEntry(input: UpdateEntryInput) {
  const index = mockEntries.findIndex((entry) => entry.id === input.id);

  if (index === -1) {
    throw new Error("Entry not found");
  }

  mockEntries[index] = {
    ...mockEntries[index],
    entry_type: input.entry_type,
    raw_text: input.raw_text,
    normalized_text: input.normalized_text || null,
    status: input.status || (input.entry_type === "task" ? "open" : "captured"),
    priority: input.priority ?? null,
    entry_date: input.entry_date,
    updated_at: now(),
  };

  return mockEntries[index];
}

export async function deleteMockEntry(id: string) {
  mockEntries = mockEntries.filter((entry) => entry.id !== id);
}

export async function markMockTaskDone(id: string) {
  const index = mockEntries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    throw new Error("Entry not found");
  }

  mockEntries[index] = {
    ...mockEntries[index],
    status: "done",
    updated_at: now(),
  };

  return mockEntries[index];
}
