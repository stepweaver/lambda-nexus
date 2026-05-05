import { createEntryAction } from "@/lib/cerebro/actions";
import { entryTypes } from "@/lib/cerebro/types";

export function EntryCreateForm() {
  return (
    <form
      action={createEntryAction}
      className="grid gap-3 rounded border border-zinc-800 bg-zinc-950 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[150px_1fr_120px]">
        <label className="grid gap-1 text-sm text-zinc-300">
          Type
          <select
            name="entry_type"
            className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100"
            defaultValue="capture"
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
          <input
            name="raw_text"
            required
            placeholder="Capture a task, note, idea, journal entry, or question"
            className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
        <label className="grid gap-1 text-sm text-zinc-300">
          Priority
          <input
            name="priority"
            type="number"
            min="0"
            max="5"
            placeholder="0-5"
            className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
      </div>
      <div className="flex justify-end">
        <button className="h-10 rounded bg-cyan-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-cyan-300">
          Create Entry
        </button>
      </div>
    </form>
  );
}
