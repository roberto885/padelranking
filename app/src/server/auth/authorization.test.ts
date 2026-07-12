import { describe, expect, it } from "vitest";
import { authorize, can, type ClubActor } from "./authorization";

const player: ClubActor = { userId: "u1", clubId: "club-a", applicationStatus: "approved", roles: ["player"] };

describe("club authorization", () => {
  it("allows a player to submit a match in their approved club", () => expect(can(player, "club-a", "match.submit")).toBe(true));
  it("denies cross-club access even when the role normally permits the action", () => expect(can(player, "club-b", "match.submit")).toBe(false));
  it("denies pending and suspended applicants", () => {
    expect(can({ ...player, applicationStatus: "pending" }, "club-a", "match.submit")).toBe(false);
    expect(can({ ...player, applicationStatus: "suspended" }, "club-a", "match.submit")).toBe(false);
  });
  it("keeps player and staff permissions separate", () => {
    expect(can(player, "club-a", "player.review")).toBe(false);
    expect(can({ ...player, roles: ["administrator"] }, "club-a", "player.review")).toBe(true);
  });
  it("throws a stable forbidden error", () => expect(() => authorize(player, "club-a", "staff.manage")).toThrow("FORBIDDEN"));
});
