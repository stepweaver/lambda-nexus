import { AppShell } from "@/components/app-shell";
import { EntryCreateForm } from "@/components/entry-form";
import { EntryGroups } from "@/components/entry-groups";
import { PageHeader } from "@/components/page-header";
import { listTodayEntries } from "@/lib/cerebro/db";

export default async function TodayPage() {
  const entries = await listTodayEntries();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Cerebro / today"
        title="Today"
        description="Current-day captures grouped by type. This view uses mock data until a local DATABASE_URL is configured."
      />
      <div className="mb-6">
        <EntryCreateForm />
      </div>
      <EntryGroups entries={entries} />
    </AppShell>
  );
}
