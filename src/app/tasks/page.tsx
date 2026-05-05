import { AppShell } from "@/components/app-shell";
import { EntryCreateForm } from "@/components/entry-form";
import { EntryList } from "@/components/entry-list";
import { PageHeader } from "@/components/page-header";
import { listOpenTasks } from "@/lib/cerebro/db";

export default async function TasksPage() {
  const tasks = await listOpenTasks();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Cerebro / tasks"
        title="Open Tasks"
        description="Task entries whose status is still open. Marking a task done updates status server-side."
      />
      <div className="mb-6">
        <EntryCreateForm />
      </div>
      <EntryList entries={tasks} taskMode />
    </AppShell>
  );
}
