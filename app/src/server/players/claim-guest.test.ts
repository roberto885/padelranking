import { describe, expect, it } from "vitest";
import { claimGuest, type GuestProfile } from "./claim-guest";
import type { AuditEvent } from "../audit/events";

describe("guest claim", () => {
  it("links the user without changing the competition identity", async () => { let profile: GuestProfile = { id: "player-1", clubId: "club-a", userId: null, kind: "guest" }; const events: AuditEvent[] = []; const result = await claimGuest({ profileId: profile.id, userId: "u1", now: new Date("2026-07-11") }, { find: async () => profile, findByUser: async () => null, save: async p => { profile = p; } }, { write: async e => { events.push(e); } }); expect(result.id).toBe("player-1"); expect(result.kind).toBe("registered"); expect(events).toHaveLength(1); });
  it("rejects a second profile for the same club user", async () => { const profile: GuestProfile = { id: "player-1", clubId: "club-a", userId: null, kind: "guest" }; await expect(claimGuest({ profileId: profile.id, userId: "u1", now: new Date() }, { find: async () => profile, findByUser: async () => ({ ...profile, id: "other" }), save: async () => {} }, { write: async () => {} })).rejects.toThrow("USER_ALREADY_HAS_PROFILE"); });
});
