import { MAX_BOOKING_MINUTES } from "../config";
import { minutesToLabel } from "./time";

export function invalidTimeMessage(): string {
  return "Invalid time values.";
}

export function rangeMessage(): string {
  return "Time must be between 00:00 and 24:00.";
}

export function orderMessage(): string {
  return "Start time must be before end time.";
}

export function pastMessage(nowMinutes: number): string {
  return `Start time must be after the current time (${minutesToLabel(nowMinutes)}).`;
}

export function tooLongMessage(): string {
  return `Bookings may not exceed ${MAX_BOOKING_MINUTES} minutes.`;
}

export function blockedMessage(roomName: string): string {
  return `"${roomName}" is currently blocked and cannot be booked.`;
}

export function overlapMessage(title: string, start: number, end: number): string {
  return `Overlaps "${title}" (${minutesToLabel(start)}–${minutesToLabel(end)}).`;
}

export function availableMessage(roomName: string, start: number, end: number): string {
  return `"${roomName}" is available for ${minutesToLabel(start)}–${minutesToLabel(end)}.`;
}
