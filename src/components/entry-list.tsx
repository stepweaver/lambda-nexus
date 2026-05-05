import {
  deleteEntryAction,
  markTaskDoneAction,
  updateEntryAction,
} from "@/lib/cerebro/actions";
import { type CerebroEntry, entryTypes } from "@/lib/cerebro/types";

function displayText(entry: CerebroEntry) {
  return entry.normalized_text || entry.raw_text;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="rounded border border-zinc-700 px-2 py-0.5 font-mono text-xs text-zinc-300">
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  return (
    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
      {status || "none"}
    </span>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded border border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{detail}</p>
    </div>
  );
}

export function EntryList({
  entries,
  taskMode = false,
}: {
  entries: CerebroEntry[];
  taskMode?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title={taskMode ? "No open tasks" : "No entries found"}
        detail={
          taskMode
            ? "Open task entries will appear here once Cerebro has captures."
            : "Create a manual entry or connect a local database to populate this view."
        }
      />
    );
  }

  return (
    <div className="grid gap-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded border border-zinc-800 bg-zinc-950 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <TypeBadge type={entry.entry_type} />
                <StatusBadge status={entry.status} />
                <span className="font-mono text-xs text-zinc-500">
                  {formatDate(entry.entry_date)}
                </span>
                {entry.priority !== null ? (
                  <span className="font-mono text-xs text-zinc-500">
                    p{entry.priority}
                  </span>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-100">
                {displayText(entry)}
              </p>
            </div>
            {entry.entry_type === "task" && entry.status !== "done" ? (
              <form action={markTaskDoneAction}>
                <input type="hidden" name="id" value={entry.id} />
                <button className="h-9 whitespace-nowrap rounded border border-emerald-800 bg-emerald-950 px-3 text-sm text-emerald-200 hover:bg-emerald-900">
                  Mark Done
                </button>
              </form>
            ) : null}
          </div>

          <details className="mt-3 border-t border-zinc-900 pt-3">
            <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
              Edit / delete
            </summary>
            <form action={updateEntryAction} className="mt-3 grid gap-3">
              <input type="hidden" name="id" value={entry.id} />
              <div className="grid gap-3 md:grid-cols-[140px_1fr_110px_130px]">
                <label className="grid gap-1 text-sm text-zinc-300">
                  Type
                  <select
                    name="entry_type"
                    defaultValue={entry.entry_type}
                    className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100"
                  >
                    {entryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm text-zinc-300">
                  Text
                  <textarea
                    name="raw_text"
                    required
                    defaultValue={entry.raw_text}
                    rows={3}
                    className="rounded border border-zinc-700 bg-[#080b0d] px-3 py-2 text-zinc-100"
                  />
                </label>
                <label className="grid gap-1 text-sm text-zinc-300">
                  Status
                  <input
                    name="status"
                    defaultValue={entry.status || ""}
                    className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100"
                  />
                </label>
                <label className="grid gap-1 text-sm text-zinc-300">
                  Date
                  <input
                    name="entry_date"
                    type="date"
                    defaultValue={formatDate(entry.entry_date)}
                    className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm text-zinc-300">
                Normalized text
                <textarea
                  name="normalized_text"
                  defaultValue={entry.normalized_text || ""}
                  rows={2}
                  className="rounded border border-zinc-700 bg-[#080b0d] px-3 py-2 text-zinc-100"
                />
              </label>
              <div className="flex flex-wrap justify-end gap-2">
                <button className="h-9 rounded border border-zinc-700 px-3 text-sm text-zinc-200 hover:bg-zinc-800">
                  Save Changes
                </button>
              </div>
            </form>
            <form action={deleteEntryAction} className="mt-2 flex justify-end">
              <input type="hidden" name="id" value={entry.id} />
              <button className="h-9 rounded border border-red-900 bg-red-950/60 px-3 text-sm text-red-200 hover:bg-red-900">
                Delete Entry
              </button>
            </form>
          </details>
        </article>
      ))}
    </div>
  );
}
