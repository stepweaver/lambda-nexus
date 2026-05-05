import { z } from "zod";
import { entryTypes } from "./types";

const entryTypeSchema = z.enum(entryTypes);

const textSchema = z
  .string()
  .trim()
  .min(1, "Entry text is required")
  .max(5000, "Entry text is too long");

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const optionalIntegerSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  },
  z.number().int().min(0).max(5).optional(),
);

export const createEntrySchema = z.object({
  entry_type: entryTypeSchema,
  raw_text: textSchema,
  normalized_text: z.string().trim().max(5000).optional(),
  status: z.string().trim().max(32).optional(),
  priority: optionalIntegerSchema,
  entry_date: dateSchema.optional(),
});

export const updateEntrySchema = createEntrySchema.extend({
  id: z.string().min(1),
  entry_date: dateSchema,
});

export const entryFilterSchema = z.object({
  entryType: entryTypeSchema.optional(),
  query: z.string().trim().max(200).optional(),
});
