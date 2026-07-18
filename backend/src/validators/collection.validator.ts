import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("A valid resource id is required"),
});

export const createCollectionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().max(500).optional().default(""),
  totalRequests: z.number().int().nonnegative().optional().default(0),
  totalTests: z.number().int().nonnegative().optional().default(0),
});

export const updateCollectionSchema = createCollectionSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export const listCollectionsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
