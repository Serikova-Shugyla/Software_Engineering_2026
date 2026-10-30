import { describe, it, expect, beforeEach } from "vitest";
import { checkAvailability, type CheckResult } from "./availability";
import type { Room, Booking } from "./types";

// Default fixture values from the spec.
const NOW = 540;
const DEFAULT_ROOM: Room = {
  id: "r1",
  name: "Lab 101",
  building: "Tech Block",
  capacity: 40,
  blocked: false,
};
const DEFAULT_BOOKINGS: Booking[] = [
  { id: "b1", roomId: "r1", start: 600, end: 660, title: "Physics Lab", bookedBy: "Prof. Garcia" },
];

// Fresh per-test copies so AC5 (data unchanged) can be asserted reliably.
let room: Room;
let bookings: Booking[];

function snapshot<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

beforeEach(() => {
  room = snapshot(DEFAULT_ROOM);
  bookings = snapshot(DEFAULT_BOOKINGS);
});

// Helper: assert a rejection with an exact reason.
function expectRejected(r: CheckResult, reason: string) {
  expect(r.ok).toBe(false);
  if (r.ok === false) expect(r.reason).toBe(reason);
}

// Helper: assert an acceptance.
function expectAccepted(r: CheckResult) {
  expect(r.ok).toBe(true);
}

describe("checkAvailability — AC1 (valid interval, start after now)", () => {
  it("T02: start == now is rejected (past)", () => {
    expectRejected(checkAvailability(540, 570, room, bookings, NOW), "past");
  });

  it("T03: zero duration is rejected (order)", () => {
    expectRejected(checkAvailability(720, 720, room, bookings, NOW), "order");
  });

  it("T04: reversed interval is rejected (order)", () => {
    expectRejected(checkAvailability(750, 720, room, bookings, NOW), "order");
  });

  it("T05: end past day end (1441) is rejected (range)", () => {
    expectRejected(checkAvailability(1380, 1441, room, bookings, NOW), "range");
  });

  it("T15 (added): NaN start is rejected (invalid)", () => {
    expectRejected(checkAvailability(NaN, 600, room, bookings, NOW), "invalid");
  });
});

describe("checkAvailability — AC2 (max 120 minutes)", () => {
  it("T06: exactly 120 min is accepted", () => {
    expectAccepted(checkAvailability(720, 840, room, bookings, NOW));
  });

  it("T07: 121 min is rejected (too_long)", () => {
    expectRejected(checkAvailability(720, 841, room, bookings, NOW), "too_long");
  });
});

describe("checkAvailability — AC3 (blocked room)", () => {
  it("T13: blocked room is rejected even with a free slot", () => {
    room.blocked = true;
    expectRejected(checkAvailability(660, 720, room, bookings, NOW), "blocked");
  });
});

describe("checkAvailability — AC4 (no overlap; touching allowed)", () => {
  it("T01: touching after a booking is accepted", () => {
    expectAccepted(checkAvailability(660, 720, room, bookings, NOW));
  });

  it("T08: touching before a booking is accepted", () => {
    expectAccepted(checkAvailability(570, 600, room, bookings, NOW));
  });

  it("T09: partial overlap is rejected (overlap)", () => {
    expectRejected(checkAvailability(630, 690, room, bookings, NOW), "overlap");
  });

  it("T10: interval containing a booking is rejected (overlap)", () => {
    expectRejected(checkAvailability(570, 690, room, bookings, NOW), "overlap");
  });

  it("T11: interval inside a booking is rejected (overlap)", () => {
    expectRejected(checkAvailability(615, 645, room, bookings, NOW), "overlap");
  });

  it("T12: interval identical to a booking is rejected (overlap)", () => {
    expectRejected(checkAvailability(600, 660, room, bookings, NOW), "overlap");
  });

  it("T14: empty bookings list is accepted", () => {
    expectAccepted(checkAvailability(630, 690, room, [], NOW));
  });

  it("T16 (added): booking in a different room does not block (room scoping)", () => {
    bookings = [
      { id: "bx", roomId: "r2", start: 630, end: 690, title: "Other Room", bookedBy: "X" },
    ];
    expectAccepted(checkAvailability(630, 690, room, bookings, NOW));
  });
});

describe("checkAvailability — AC5 (does not modify bookings)", () => {
  it("accepted result leaves bookings data unchanged", () => {
    const before = snapshot(bookings);
    const r = checkAvailability(660, 720, room, bookings, NOW);
    expectAccepted(r);
    expect(bookings).toEqual(before);
    expect(bookings).toHaveLength(before.length);
    expect(bookings[0]).toEqual(before[0]);
  });

  it("rejected result leaves bookings data unchanged", () => {
    const before = snapshot(bookings);
    const r = checkAvailability(630, 690, room, bookings, NOW);
    expectRejected(r, "overlap");
    expect(bookings).toEqual(before);
  });

    it("BUG-B: unsorted bookings keep their original order", () => {
    bookings = [
      { id: "b2", roomId: "r1", start: 800, end: 860, title: "Chemistry", bookedBy: "Dr. Lee" },
      { id: "b1", roomId: "r1", start: 600, end: 660, title: "Physics Lab", bookedBy: "Prof. Garcia" },
    ];
    const before = snapshot(bookings);
    const r = checkAvailability(660, 720, room, bookings, NOW);
    expectAccepted(r);
    expect(bookings).toEqual(before);
    expect(bookings.map((b) => b.id)).toEqual(["b2", "b1"]);
  });
});
