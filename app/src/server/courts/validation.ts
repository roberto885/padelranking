import { z } from "zod";

export const courtSchema = z.object({
  clubId: z.string().uuid(),
  locationId: z.string().uuid(),
  name: z.string().trim().min(1).max(60),
  environment: z.enum(["indoor", "outdoor"]),
  active: z.boolean().default(true),
});

export const operatingWindowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine(({ opensAt, closesAt }) => opensAt < closesAt, { message: "Closing time must be after opening time", path: ["closesAt"] });
