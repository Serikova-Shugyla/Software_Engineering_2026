import { describe, it, expect } from "vitest";
import { filterRooms, parseAttendees, emptyRequirements } from "./filter";
import { checkAvailability } from "./availability";
import { SAMPLE_ROOMS } from "../data/rooms";
import { SAMPLE_BOOKINGS } from "../data/bookings";
import type { Room, RoomRequirements } from "../types";

const NOW = 480; // 08:00 fixed clock
const ids = (rooms: Room[]) => rooms.map((r) => r.id);
const req = (attendees: number, equipment: RoomRequirements["equipment"] = []): RoomRequirements => ({
  attendees,
  equipment,
});

describe("Room catalog (data sanity)", () => {
  it("C1: catalog has at least four rooms with unique ids and all required fields", () => {
    expect(SAMPLE_ROOMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids(SAMPLE_ROOMS)).size).toBe(SAMPLE_ROOMS.length);
    for (const r of SAMPLE_ROOMS) {
      expect(typeof r.id).toBe("string");
      expect(r.name.length).toBeGreaterThan(0);
      expect(r.capacity).toBeGreaterThan(0);
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(typeof r.blocked).toBe("boolean");
    }
  });
});

describe("F1 capacity filter", () => {
  it("F1a: capacity exactly equal to attendees is accepted (boundary)", () => {
    expect(ids(filterRooms(SAMPLE_ROOMS, req(40)))).toContain("r2"); // Lab 101 has 40 seats
  });

  it("F1b: capacity one below attendees is rejected (boundary)", () => {
    expect(ids(filterRooms(SAMPLE_ROOMS, req(41)))).not.toContain("r2");
  });

  it("F1c: insufficient capacity excludes small rooms", () => {
    expect(ids(filterRooms(SAMPLE_ROOMS, req(100)))).toEqual(["r1", "r5"]);
  });
});

describe("F2 equipment filter", () => {
  it("F2a: a single required item keeps only rooms that have it", () => {
    expect(ids(filterRooms(SAMPLE_ROOMS, req(0, ["computers"])))).toEqual(["r2"]);
  });

  it("F2b: ALL selected items are required (room missing one is excluded)", () => {
    // r4 has projector but no microphone; r2 has projector but no microphone
    expect(ids(filterRooms(SAMPLE_ROOMS, req(0, ["projector", "microphone"])))).toEqual(["r1", "r5"]);
  });

  it("F2c: capacity and equipment combine with AND", () => {
    expect(ids(filterRooms(SAMPLE_ROOMS, req(150, ["whiteboard"])))).toEqual(["r5"]);
  });

  it("F2d: no requirements returns every room, in order", () => {
    expect(ids(filterRooms(SAMPLE_ROOMS, emptyRequirements()))).toEqual(ids(SAMPLE_ROOMS));
  });

  it("F2e: filtering does not mutate the catalog or the requirements", () => {
    const rooms = JSON.parse(JSON.stringify(SAMPLE_ROOMS)) as Room[];
    const r = req(30, ["projector"]);
    const rBefore = JSON.parse(JSON.stringify(r));
    filterRooms(rooms, r);
    expect(rooms).toEqual(SAMPLE_ROOMS);
    expect(r).toEqual(rBefore);
  });
});

describe("F4 no matching rooms", () => {
  it("F4a: impossible requirements return an empty list (drives the empty state)", () => {
    expect(filterRooms(SAMPLE_ROOMS, req(201))).toEqual([]);
    expect(filterRooms(SAMPLE_ROOMS, req(0, ["computers", "microphone"]))).toEqual([]);
  });
});

describe("parseAttendees", () => {
  it("P1: valid numbers, blanks and garbage", () => {
    expect(parseAttendees("25")).toBe(25);
    expect(parseAttendees("")).toBe(0);
    expect(parseAttendees("abc")).toBe(0);
    expect(parseAttendees("-5")).toBe(0);
    expect(parseAttendees("12.9")).toBe(12);
  });
});

describe("F3 blocked room + F5 per-room data", () => {
  it("F3a: a blocked room that matches the filters is still reported Unavailable", () => {
    const matching = filterRooms(SAMPLE_ROOMS, req(30, ["video-conferencing"]));
    expect(ids(matching)).toContain("r4");
    const r4 = SAMPLE_ROOMS.find((r) => r.id === "r4")!;
    const res = checkAvailability(900, 960, r4, SAMPLE_BOOKINGS, NOW); // free slot, but blocked
    expect(res.ok).toBe(false);
    if (res.ok === false) expect(res.reason).toBe("blocked");
  });

  it("F5a: same interval, different rooms -> uses only the chosen room's bookings", () => {
    const r1 = SAMPLE_ROOMS.find((r) => r.id === "r1")!;
    const r2 = SAMPLE_ROOMS.find((r) => r.id === "r2")!;
    // 09:30-10:00 overlaps r1's 09:00-10:30 booking, but only TOUCHES r2's 10:00-11:00 booking
    const a = checkAvailability(570, 600, r1, SAMPLE_BOOKINGS, NOW);
    const b = checkAvailability(570, 600, r2, SAMPLE_BOOKINGS, NOW);
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(true);
  });
});
