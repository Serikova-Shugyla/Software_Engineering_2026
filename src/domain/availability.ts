import type { Room, Booking } from "../types";
import { DAY_START_MINUTES, DAY_END_MINUTES, MAX_BOOKING_MINUTES } from "../config";
import { getRoomBookings } from "./bookings";
import {
  availableMessage,
  blockedMessage,
  invalidTimeMessage,
  orderMessage,
  overlapMessage,
  pastMessage,
  rangeMessage,
  tooLongMessage,
} from "./messages";

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
    return { ok: false, message: invalidTimeMessage(), reason: "invalid" };
  }
  if (start < DAY_START_MINUTES || end > DAY_END_MINUTES) {
    return { ok: false, message: rangeMessage(), reason: "range" };
  }
  if (start >= end) {
    return { ok: false, message: orderMessage(), reason: "order" };
  }
  if (start <= nowMinutes) {
    return { ok: false, message: pastMessage(nowMinutes), reason: "past" };
  }

  // AC2: max duration
  if (exceedsMaxDuration(start, end)) {
    return { ok: false, message: tooLongMessage(), reason: "too_long" };
  }

  // AC3 / F3: blocked room is never available
  if (room.blocked) {
    return { ok: false, message: blockedMessage(room.name), reason: "blocked" };
  }

  // AC4: no overlap with THIS room's bookings (touching endpoints allowed)
  const conflict = getRoomBookings(bookings, room.id).find(
    (b) => start < b.end && b.start < end
  );
  if (conflict) {
    return {
      ok: false,
      message: overlapMessage(conflict.title, conflict.start, conflict.end),
      reason: "overlap",
    };
  }

  // AC5: available — does NOT modify bookings
  return {
    ok: true,
    message: availableMessage(room.name, start, end),
  };
}
