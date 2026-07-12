import { authorize, type ClubActor } from "../auth/authorization";
import type { AuditWriter } from "../audit/events";

export type Application = { id: string; clubId: string; userId: string; status: "pending" | "approved" | "rejected" | "suspended" | "withdrawn"; verifiedLevel?: string };
export interface ApplicationRepository { find(id: string): Promise<Application | null>; save(application: Application): Promise<void> }

export async function reviewApplication(input: { actor: ClubActor; applicationId: string; decision: "approved" | "rejected"; verifiedLevel?: string; reason?: string }, repo: ApplicationRepository, audit: AuditWriter) {
  const application = await repo.find(input.applicationId);
  if (!application) throw new Error("APPLICATION_NOT_FOUND");
  authorize(input.actor, application.clubId, "player.review");
  if (application.status !== "pending") throw new Error("APPLICATION_NOT_PENDING");
  if (input.decision === "approved" && !input.verifiedLevel) throw new Error("VERIFIED_LEVEL_REQUIRED");
  if (input.decision === "rejected" && !input.reason?.trim()) throw new Error("REASON_REQUIRED");
  const before = { ...application };
  const updated = { ...application, status: input.decision, verifiedLevel: input.verifiedLevel };
  await repo.save(updated);
  await audit.write({ clubId: application.clubId, actorUserId: input.actor.userId, action: `application.${input.decision}`, targetType: "club_application", targetId: application.id, reason: input.reason, before, after: updated });
  return updated;
}
