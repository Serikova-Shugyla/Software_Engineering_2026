import { describe, it, expect } from "vitest";
import { getRoomBookings, sortByStart } from "./bookings";
import { SAMPLE_BOOKINGS } from "../data/bookings";

describe("booking helpers", () => {
  it("B1: getRoomBookings returns only the requested room's bookings", () => {
    const r3 = getRoomBookings(SAMPLE_BOOKINGS, "r3");
    expect(r3.length).toBeGreaterThan(0);
    expect(r3.every((b) => b.roomId === "r3")).toBe(true);
    expect(getRoomBookings(SAMPLE_BOOKINGS, "r4")).toEqual([]);
  });

  it("B2: sortByStart returns a sorted copy and never mutates the input (AC5)", () => {
    const input = JSON.parse(JSON.stringify(SAMPLE_BOOKINGS.slice().reverse()));
    const before = JSON.parse(JSON.stringify(input));
    const out = sortByStart(input);
    expect(input).toEqual(before);
    expect(out.map((b) => b.start)).toEqual(out.map((b) => b.start).sort((x, y) => x - y));
  });
});
