import type { AuditWriter } from "../audit/events";

export type GuestProfile = { id: string; clubId: string; userId: string | null; kind: "guest" | "registered"; claimedAt?: Date };
export interface GuestRepository { find(id: string): Promise<GuestProfile | null>; findByUser(clubId: string, userId: string): Promise<GuestProfile | null>; save(profile: GuestProfile): Promise<void> }

export async function claimGuest(input: { profileId: string; userId: string; now: Date }, repo: GuestRepository, audit: AuditWriter) {
  const profile = await repo.find(input.profileId);
  if (!profile || profile.kind !== "guest") throw new Error("GUEST_NOT_FOUND");
  if (profile.userId || profile.claimedAt) throw new Error("GUEST_ALREADY_CLAIMED");
  if (await repo.findByUser(profile.clubId, input.userId)) throw new Error("USER_ALREADY_HAS_PROFILE");
  const updated: GuestProfile = { ...profile, userId: input.userId, kind: "registered", claimedAt: input.now };
  await repo.save(updated);
  await audit.write({ clubId: profile.clubId, actorUserId: input.userId, action: "guest.claimed", targetType: "player_profile", targetId: profile.id, before: profile, after: updated });
  return updated;
}
