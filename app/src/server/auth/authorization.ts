export type ClubRole = "owner" | "administrator" | "tournament_director" | "player";
export type Permission = "club.manage" | "staff.manage" | "player.review" | "court.manage" | "event.manage" | "event.assigned.manage" | "match.submit" | "profile.self.manage";

const permissions: Record<ClubRole, ReadonlySet<Permission>> = {
  owner: new Set(["club.manage", "staff.manage", "player.review", "court.manage", "event.manage", "event.assigned.manage", "match.submit", "profile.self.manage"]),
  administrator: new Set(["player.review", "court.manage", "event.manage", "event.assigned.manage", "match.submit", "profile.self.manage"]),
  tournament_director: new Set(["event.assigned.manage", "match.submit", "profile.self.manage"]),
  player: new Set(["match.submit", "profile.self.manage"]),
};

export type ClubActor = { userId: string; clubId: string; applicationStatus: "approved" | "pending" | "suspended" | "rejected" | "withdrawn"; roles: ClubRole[] };

export function can(actor: ClubActor, clubId: string, permission: Permission): boolean {
  if (actor.clubId !== clubId || actor.applicationStatus !== "approved") return false;
  return actor.roles.some((role) => permissions[role].has(permission));
}

export function authorize(actor: ClubActor, clubId: string, permission: Permission): void {
  if (!can(actor, clubId, permission)) throw new Error("FORBIDDEN");
}
