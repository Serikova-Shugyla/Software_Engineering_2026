import type { Booking } from "../types";

/** The ONLY place that decides which bookings belong to a room. */
export function getRoomBookings(bookings: readonly Booking[], roomId: string): Booking[] {
  return bookings.filter((b) => b.roomId === roomId);
}

/** Returns a sorted COPY; never mutates the input (AC5). */
export function sortByStart(bookings: readonly Booking[]): Booking[] {
  return [...bookings].sort((a, b) => a.start - b.start);
}
