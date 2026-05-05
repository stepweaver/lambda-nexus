import { entryTypes, type EntryType } from "@/lib/cerebro/types";

export function EntryFilters({
  entryType,
  query,
}: {
  entryType?: EntryType;
  query?: string;
}) {
  return (
    <form className="mb-4 grid gap-3 rounded border border-zinc-800 bg-zinc-950 p-4 sm:grid-cols-[160px_1fr_auto]">
      <label className="grid gap-1 text-sm text-zinc-300">
        Type
        <select
          name="type"
          defaultValue={entryType || ""}
          className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100"
        >
          <option value="">all</option>
          {entryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm text-zinc-300">
        Search
        <input
          name="q"
          defaultValue={query || ""}
          placeholder="Search raw or normalized text"
          className="h-10 rounded border border-zinc-700 bg-[#080b0d] px-3 text-zinc-100 placeholder:text-zinc-600"
        />
      </label>
      <div className="flex items-end">
        <button className="h-10 w-full rounded border border-zinc-700 px-4 text-sm text-zinc-200 hover:bg-zinc-800 sm:w-auto">
          Apply
        </button>
      </div>
    </form>
  );
}
