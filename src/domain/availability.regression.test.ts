import { describe, it, expect } from "vitest";
import { checkAvailability, type CheckResult } from "./availability";
import type { Room, Booking } from "../types";

const NOW = 540; // 09:00, fixed current time

function makeRoom(blocked = false): Room {
  return {
    id: "r1",
    name: "Lab 101",
    building: "Tech Block",
    capacity: 40,
    equipment: [],
    blocked,
  };
}

function makeBookings(): Booking[] {
  return [
    { id: "b1", roomId: "r1", start: 600, end: 660, title: "Physics Lab", bookedBy: "Prof. Garcia" },
    { id: "b2", roomId: "r1", start: 720, end: 780, title: "Chemistry", bookedBy: "Dr. Lee" },
  ];
}

function expectRejected(r: CheckResult, reason: string) {
  expect(r.ok).toBe(false);
  if (r.ok === false) expect(r.reason).toBe(reason);
}

describe("Regression (Practice #09) - AC1: valid interval and not in the past", () => {
  it("past time: start before current time is rejected", () => {
    // AC1: a request that starts before "now" (09:00) must be rejected.
    expectRejected(checkAvailability(500, 560, makeRoom(), makeBookings(), NOW), "past");
  });

  it("reversed interval: start after end is rejected", () => {
    // AC1: start >= end is invalid.
    expectRejected(checkAvailability(900, 840, makeRoom(), makeBookings(), NOW), "order");
  });
});

describe("Regression (Practice #09) - AC2: maximum 120 minutes", () => {
  it("121-minute duration is rejected", () => {
    // AC2: durations longer than 120 minutes are rejected.
    expectRejected(checkAvailability(840, 961, makeRoom(), makeBookings(), NOW), "too_long");
  });

  it("exactly 120 minutes is still accepted (boundary)", () => {
    // AC2 boundary: 120 is allowed, only >120 is rejected.
    expect(checkAvailability(840, 960, makeRoom(), makeBookings(), NOW).ok).toBe(true);
  });
});

describe("Regression (Practice #09) - AC3: blocked room", () => {
  it("blocked room is rejected even when the time slot is free", () => {
    // AC3: a blocked room can never be booked.
    expectRejected(checkAvailability(840, 900, makeRoom(true), makeBookings(), NOW), "blocked");
  });

  it("blocked room is rejected even with no bookings at all", () => {
    expectRejected(checkAvailability(840, 900, makeRoom(true), [], NOW), "blocked");
  });
});

describe("Regression (Practice #09) - AC4: overlap vs touching endpoints", () => {
  it("overlap with the second of several bookings is rejected", () => {
    // AC4: any overlap (here with b2 720-780) is rejected.
    expectRejected(checkAvailability(700, 730, makeRoom(), makeBookings(), NOW), "overlap");
  });

  it("slot touching two bookings only at endpoints is accepted", () => {
    // AC4: 660-720 touches b1 end (660) and b2 start (720) but does not overlap.
    expect(checkAvailability(660, 720, makeRoom(), makeBookings(), NOW).ok).toBe(true);
  });
});

describe("Regression (Practice #09) - AC5: fixtures are not mutated", () => {
  it("frozen fixtures: accepted check does not try to modify data", () => {
    // AC5: frozen objects throw on mutation in strict mode, so no throw = no mutation.
    const room = Object.freeze(makeRoom());
    const bookings = Object.freeze(makeBookings().map((b) => Object.freeze(b))) as Booking[];
    const before = JSON.stringify(bookings);
    expect(() => checkAvailability(660, 720, room, bookings, NOW)).not.toThrow();
    expect(JSON.stringify(bookings)).toBe(before);
  });

  it("frozen fixtures: rejected check does not try to modify data", () => {
    const room = Object.freeze(makeRoom());
    const bookings = Object.freeze(makeBookings().map((b) => Object.freeze(b))) as Booking[];
    const before = JSON.stringify(bookings);
    expect(() => checkAvailability(700, 730, room, bookings, NOW)).not.toThrow();
    expect(JSON.stringify(bookings)).toBe(before);
  });

  it("same input gives the same result on repeated calls", () => {
    const bookings = makeBookings();
    const first = checkAvailability(660, 720, makeRoom(), bookings, NOW);
    const second = checkAvailability(660, 720, makeRoom(), bookings, NOW);
    expect(second).toEqual(first);
  });
});