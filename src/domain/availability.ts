import type { Room, Booking } from "../types";
import { DAY_START_MINUTES, DAY_END_MINUTES, MAX_BOOKING_MINUTES } from "../config";
import { minutesToLabel } from "./time";
import { getRoomBookings } from "./bookings";

export type CheckResult =
  | { ok: true; message: string }
  | { ok: false; message: string; reason: string };

/** AC2 rule, shared by the validator and the UI duration hint. */
export function exceedsMaxDuration(start: number, end: number): boolean {
  return end - start > MAX_BOOKING_MINUTES;
}

export function checkAvailability(
  start: number,
  end: number,
  room: Room,
  bookings: Booking[],
  nowMinutes: number
): CheckResult {
  // AC1: valid interval, start after current time
  if (isNaN(start) || isNaN(end)) {
    return { ok: false, message: "Invalid time values.", reason: "invalid" };
  }
  if (start < DAY_START_MINUTES || end > DAY_END_MINUTES) {
    return { ok: false, message: "Time must be between 00:00 and 24:00.", reason: "range" };
  }
  if (start >= end) {
    return { ok: false, message: "Start time must be before end time.", reason: "order" };
  }
  if (start <= nowMinutes) {
    return {
      ok: false,
      message: `Start time must be after the current time (${minutesToLabel(nowMinutes)}).`,
      reason: "past",
    };
  }

  // AC2: max duration
  if (exceedsMaxDuration(start, end)) {
    return {
      ok: false,
      message: `Bookings may not exceed ${MAX_BOOKING_MINUTES} minutes.`,
      reason: "too_long",
    };
  }

  // AC3 / F3: blocked room is never available
  if (room.blocked) {
    return {
      ok: false,
      message: `"${room.name}" is currently blocked and cannot be booked.`,
      reason: "blocked",
    };
  }

  // AC4: no overlap with THIS room's bookings (touching endpoints allowed)
  const conflict = getRoomBookings(bookings, room.id).find(
    (b) => start < b.end && b.start < end
  );
  if (conflict) {
    return {
      ok: false,
      message: `Overlaps "${conflict.title}" (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}).`,
      reason: "overlap",
    };
  }

  // AC5: available — does NOT modify bookings
  return {
    ok: true,
    message: `"${room.name}" is available for ${minutesToLabel(start)}–${minutesToLabel(end)}.`,
  };
}
