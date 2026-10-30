import type { Room, Booking } from "./types";

export type CheckResult =
  | { ok: true; message: string }
  | { ok: false; message: string; reason: string };

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
  if (start < 0 || end > 1440) {
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

  // AC2: max 120 minutes
  if (end - start > 120) {
    return {
      ok: false,
      message: "Bookings may not exceed 120 minutes.",
      reason: "too_long",
    };
  }

  // AC3: blocked room
  if (room.blocked) {
    return {
      ok: false,
      message: `"${room.name}" is currently blocked and cannot be booked.`,
      reason: "blocked",
    };
  }

  // AC4: no overlap with existing bookings (touching endpoints allowed)
  bookings.sort((a, b) => a.start - b.start);
  const overlaps = bookings.filter(
    (b) => b.roomId === room.id && start < b.end && b.start < end
  );
  if (overlaps.length > 0) {
    const b = overlaps[0];
    return {
      ok: false,
      message: `Overlaps "${b.title}" (${minutesToLabel(b.start)}–${minutesToLabel(b.end)}).`,
      reason: "overlap",
    };
  }

  // AC5: available — does NOT modify bookings
  return {
    ok: true,
    message: `"${room.name}" is available for ${minutesToLabel(start)}–${minutesToLabel(end)}.`,
  };
}

// Import here to avoid circular deps
import { minutesToLabel } from "./timeUtils";
