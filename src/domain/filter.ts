import type { Room, RoomRequirements } from "../types";

export function emptyRequirements(): RoomRequirements {
  return { attendees: 0, equipment: [] };
}

/** F1: capacity >= attendees.  F2: room has ALL selected equipment items. */
export function matchesRequirements(room: Room, req: RoomRequirements): boolean {
  return (
    room.capacity >= req.attendees &&
    req.equipment.every((item) => room.equipment.includes(item))
  );
}

/** Pure: returns a new array, never mutates `rooms`. Blocked rooms are NOT hidden here (see F3 in availability). */
export function filterRooms(rooms: readonly Room[], req: RoomRequirements): Room[] {
  return rooms.filter((room) => matchesRequirements(room, req));
}

/** Text input -> non-negative whole number; anything invalid means "no minimum" (0). */
export function parseAttendees(raw: string): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
