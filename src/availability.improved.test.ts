import { describe, it, expect, beforeEach } from "vitest";
import { checkAvailability, type CheckResult } from "./availability";
import type { Room, Booking } from "./types";

// Improved with Claude after review.
// Original 18 tests (T01..T16 + 2x AC5) preserved with their expectations,
// plus R1..R7 boundary / readability / room-integrity improvements.
//
// Improvements over the first suite:
//  R1: accepted side of the day-end boundary (end = 1440) is accepted — pins the
//      "<= day end" boundary so a mutation of `end > 1440` to `end >= 1440` is caught.
//  R2: start = now + 1 is accepted — pins the strict "start AFTER now" rule so a
//      mutation of `start <= nowMinutes` to `start < nowMinutes` is caught.
//  R3: negative start is rejected (range) — covers the lower-bound branch of AC1,
//      which no original case exercises (only the upper bound via T05).
//  R4: NaN end is rejected (invalid) — T15 only tested NaN start; NaN end takes a
//      different path and could be missed if the guard were split.
//  R5: gap between two bookings is accepted — T14 used an empty list; a real gap
//      proves overlap detection is not over-conservative between adjacent bookings.
//  R6: AC5 also asserts the room object is unchanged — the first suite only
//      checked bookings; a mutation that flips room.blocked would slip through.
//  R7: AC6 message readability — on accept, the message contains the room name and
//      a formatted interval, so a regression that drops minutesToLabel is caught.
//  R8: AC2 lower boundary — a 1-minute booking is accepted, pinning the smallest
//      legal duration so an accidental `end - start < 1` guard is caught.
//  R9: AC4 shared-start boundary — start == b.start with end < b.end is an overlap,
//      catching a one-sided relaxation of the overlap filter (only `<=` on one side).
// R10: AC6 rejection-message readability — the overlap message names the conflicting
//      booking and shows its formatted interval, so a minutesToLabel drop is caught.
// R11: AC5 room-unchanged on the accepted path — R6 only covered the rejected path.

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

let room: Room;
let bookings: Booking[];

function snapshot<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

beforeEach(() => {
  room = snapshot(DEFAULT_ROOM);
  bookings = snapshot(DEFAULT_BOOKINGS);
});

function expectRejected(r: CheckResult, reason: string) {
  expect(r.ok).toBe(false);
  if (r.ok === false) expect(r.reason).toBe(reason);
}

function expectAccepted(r: CheckResult) {
  expect(r.ok).toBe(true);
}

// ---------------------------------------------------------------------------
// AC1 — valid interval, start strictly after now
// ---------------------------------------------------------------------------
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

  it("T15: NaN start is rejected (invalid)", () => {
    expectRejected(checkAvailability(NaN, 600, room, bookings, NOW), "invalid");
  });

  it("R1: end exactly at day end (1440) is accepted (upper boundary)", () => {
    expectAccepted(checkAvailability(1380, 1440, room, bookings, NOW));
  });

  it("R2: start = now + 1 is accepted (strict after-now boundary)", () => {
    expectAccepted(checkAvailability(541, 600, room, bookings, NOW));
  });

  it("R3: negative start is rejected (range, lower boundary)", () => {
    expectRejected(checkAvailability(-1, 600, room, bookings, NOW), "range");
  });

  it("R4: NaN end is rejected (invalid)", () => {
    expectRejected(checkAvailability(600, NaN, room, bookings, NOW), "invalid");
  });
});

// ---------------------------------------------------------------------------
// AC2 — max 120 minutes
// ---------------------------------------------------------------------------
describe("checkAvailability — AC2 (max 120 minutes)", () => {
  it("T06: exactly 120 min is accepted", () => {
    expectAccepted(checkAvailability(720, 840, room, bookings, NOW));
  });

  it("T07: 121 min is rejected (too_long)", () => {
    expectRejected(checkAvailability(720, 841, room, bookings, NOW), "too_long");
  });

  it("R8: 1-minute booking is accepted (lower duration boundary)", () => {
    expectAccepted(checkAvailability(541, 542, room, bookings, NOW));
  });
});

// ---------------------------------------------------------------------------
// AC3 — blocked room
// ---------------------------------------------------------------------------
describe("checkAvailability — AC3 (blocked room)", () => {
  it("T13: blocked room is rejected even with a free slot", () => {
    room.blocked = true;
    expectRejected(checkAvailability(660, 720, room, bookings, NOW), "blocked");
  });
});

// ---------------------------------------------------------------------------
// AC4 — no overlap; touching endpoints allowed
// ---------------------------------------------------------------------------
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

  it("T16: booking in a different room does not block (room scoping)", () => {
    bookings = [
      { id: "bx", roomId: "r2", start: 630, end: 690, title: "Other Room", bookedBy: "X" },
    ];
    expectAccepted(checkAvailability(630, 690, room, bookings, NOW));
  });

  it("R5: gap between two bookings is accepted", () => {
    bookings = [
      { id: "a", roomId: "r1", start: 570, end: 600, title: "Early", bookedBy: "A" },
      { id: "b", roomId: "r1", start: 660, end: 720, title: "Late", bookedBy: "B" },
    ];
    expectAccepted(checkAvailability(600, 660, room, bookings, NOW));
  });

  it("R9: shared start with a booking (end < b.end) is rejected (overlap)", () => {
    // start == b.start (600), end < b.end (660) -> overlaps on the b.start < end side.
    expectRejected(checkAvailability(600, 630, room, bookings, NOW), "overlap");
  });
});

// ---------------------------------------------------------------------------
// AC5 — does not modify bookings OR room
// ---------------------------------------------------------------------------
describe("checkAvailability — AC5 (does not modify bookings or room)", () => {
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

  it("R6: room object is unchanged after a rejected call", () => {
    room.blocked = true;
    const roomBefore = snapshot(room);
    const r = checkAvailability(660, 720, room, bookings, NOW);
    expectRejected(r, "blocked");
    expect(room).toEqual(roomBefore);
    expect(room.blocked).toBe(true);
  });

  it("R11: room object is unchanged after an accepted call", () => {
    const roomBefore = snapshot(room);
    const r = checkAvailability(660, 720, room, bookings, NOW);
    expectAccepted(r);
    expect(room).toEqual(roomBefore);
    expect(room.blocked).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC6 — success message is readable and contains key info
// ---------------------------------------------------------------------------
describe("checkAvailability — AC6 (message readability)", () => {
  it("R7: accepted message names the room and a fully-formatted interval", () => {
    const r = checkAvailability(660, 720, room, bookings, NOW);
    expectAccepted(r);
    if (r.ok === true) {
      expect(r.message).toContain(room.name);
      expect(r.message).toMatch(/11:00 AM.*12:00 PM/);
      expect(r.message.length).toBeGreaterThan(10);
    }
  });

  it("R10: overlap rejection message names the booking and its interval", () => {
    const r = checkAvailability(630, 690, room, bookings, NOW);
    expectRejected(r, "overlap");
    if (r.ok === false) {
      expect(r.message).toContain("Physics Lab");
      expect(r.message).toMatch(/10:00 AM.*11:00 AM/);
    }
  });
});
