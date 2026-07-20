import { z } from "zod";

export const logQuerySchema = z.object({
  type: z.enum(["REQUEST", "AUTH", "EXECUTION", "ERROR", "SYSTEM"]).optional(),
  level: z.enum(["info", "warn", "error"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(200).optional().default(50),
});
