import { describe, expect, it } from "vitest";
import { reviewApplication, type Application } from "./review";
import type { AuditEvent } from "../audit/events";

const admin = { userId: "admin", clubId: "club-a", applicationStatus: "approved" as const, roles: ["administrator" as const] };
function setup(application: Application) { let saved = application; const events: AuditEvent[] = []; return { repo: { find: async () => saved, save: async (value: Application) => { saved = value; } }, audit: { write: async (event: AuditEvent) => { events.push(event); } }, events, get saved() { return saved; } }; }

describe("application review", () => {
  it("approves with a verified level and audit record", async () => { const x = setup({ id: "a1", clubId: "club-a", userId: "u1", status: "pending" }); await reviewApplication({ actor: admin, applicationId: "a1", decision: "approved", verifiedLevel: "Intermediate" }, x.repo, x.audit); expect(x.saved.status).toBe("approved"); expect(x.events[0].action).toBe("application.approved"); });
  it("requires a verified level for approval", async () => { const x = setup({ id: "a1", clubId: "club-a", userId: "u1", status: "pending" }); await expect(reviewApplication({ actor: admin, applicationId: "a1", decision: "approved" }, x.repo, x.audit)).rejects.toThrow("VERIFIED_LEVEL_REQUIRED"); });
  it("prevents cross-club review", async () => { const x = setup({ id: "a1", clubId: "club-b", userId: "u1", status: "pending" }); await expect(reviewApplication({ actor: admin, applicationId: "a1", decision: "approved", verifiedLevel: "2" }, x.repo, x.audit)).rejects.toThrow("FORBIDDEN"); });
});
