import { EntryList, EmptyState } from "./entry-list";
import { entryTypes, type CerebroEntry } from "@/lib/cerebro/types";

export function EntryGroups({ entries }: { entries: CerebroEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No captures today"
        detail="Today's Telegram and manual captures will group by type here."
      />
    );
  }

  return (
    <div className="grid gap-5">
      {entryTypes.map((type) => {
        const grouped = entries.filter((entry) => entry.entry_type === type);

        if (grouped.length === 0) {
          return null;
        }

        return (
          <section key={type}>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="font-mono text-sm uppercase text-zinc-300">{type}</h2>
              <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
                {grouped.length}
              </span>
            </div>
            <EntryList entries={grouped} taskMode={type === "task"} />
          </section>
        );
      })}
    </div>
  );
}
