import { describe, expect, it } from "vitest";
import { operatingWindowSchema } from "./validation";

describe("court operating windows", () => {
  it("accepts a valid same-day window", () => expect(operatingWindowSchema.safeParse({ dayOfWeek: 1, opensAt: "07:00", closesAt: "23:00" }).success).toBe(true));
  it("rejects inverted and malformed windows", () => { expect(operatingWindowSchema.safeParse({ dayOfWeek: 1, opensAt: "23:00", closesAt: "07:00" }).success).toBe(false); expect(operatingWindowSchema.safeParse({ dayOfWeek: 8, opensAt: "7", closesAt: "25:00" }).success).toBe(false); });
});
