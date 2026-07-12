import { z } from "zod";

export const playerApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  preferredLocale: z.enum(["es-MX", "en"]),
  selfAssessedLevel: z.string().trim().min(1).max(40),
  dominantHand: z.enum(["left", "right"]).optional(),
  preferredSide: z.enum(["left", "right", "either"]).optional(),
});

export const guestPlayerSchema = playerApplicationSchema.pick({ fullName: true, preferredLocale: true }).extend({
  verifiedLevel: z.string().trim().min(1).max(40).optional(),
});
