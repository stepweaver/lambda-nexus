"use server";

import { revalidatePath } from "next/cache";
import {
  createEntry,
  deleteEntry,
  markTaskDone,
  updateEntry,
} from "./db";
import { createEntrySchema, updateEntrySchema } from "./validation";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function revalidateMvpRoutes() {
  revalidatePath("/today");
  revalidatePath("/entries");
  revalidatePath("/tasks");
}

export async function createEntryAction(formData: FormData) {
  const parsed = createEntrySchema.parse({
    entry_type: formValue(formData, "entry_type"),
    raw_text: formValue(formData, "raw_text"),
    normalized_text: formValue(formData, "normalized_text"),
    status: formValue(formData, "status"),
    priority: formValue(formData, "priority"),
    entry_date: formValue(formData, "entry_date") || undefined,
  });

  await createEntry(parsed);
  revalidateMvpRoutes();
}

export async function updateEntryAction(formData: FormData) {
  const parsed = updateEntrySchema.parse({
    id: formValue(formData, "id"),
    entry_type: formValue(formData, "entry_type"),
    raw_text: formValue(formData, "raw_text"),
    normalized_text: formValue(formData, "normalized_text"),
    status: formValue(formData, "status"),
    priority: formValue(formData, "priority"),
    entry_date: formValue(formData, "entry_date"),
  });

  await updateEntry(parsed);
  revalidateMvpRoutes();
}

export async function deleteEntryAction(formData: FormData) {
  const id = formValue(formData, "id");

  if (!id) {
    throw new Error("Entry id is required");
  }

  await deleteEntry(id);
  revalidateMvpRoutes();
}

export async function markTaskDoneAction(formData: FormData) {
  const id = formValue(formData, "id");

  if (!id) {
    throw new Error("Task id is required");
  }

  await markTaskDone(id);
  revalidateMvpRoutes();
}
