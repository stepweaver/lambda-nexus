import { AppShell } from "@/components/app-shell";
import { EntryCreateForm } from "@/components/entry-form";
import { EntryFilters } from "@/components/filters";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { listEntries } from "@/lib/cerebro/db";
import { entryFilterSchema } from "@/lib/cerebro/validation";

type EntriesSearchParams = Promise<{
  type?: string;
  q?: string;
}>;

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: EntriesSearchParams;
}) {
  const params = await searchParams;
  const filters = entryFilterSchema.parse({
    entryType: params.type || undefined,
    query: params.q || undefined,
  });
  const entries = await listEntries({
    entryType: filters.entryType,
    query: filters.query,
    limit: 75,
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Cerebro / entries"
        title="Recent Entries"
        description="Browse, filter, search, create, edit, and delete captured rows from the Cerebro single-table model."
      />
      <EntryFilters entryType={filters.entryType} query={filters.query} />
      <div className="mb-6">
        <EntryCreateForm />
      </div>
      <EntryList entries={entries} />
    </AppShell>
  );
}
