import type { Booking, Equipment, Room, RoomRequirements } from "../types";
import { DEFAULT_NOW_MINUTES } from "../config";
import { checkAvailability, type CheckResult } from "../domain/availability";
import { emptyRequirements, filterRooms } from "../domain/filter";
import { timeInputToMinutes, timeInputValue } from "../domain/time";

export type TimeField = "startTime" | "endTime" | "nowTime";

export interface CheckerState {
  requirements: RoomRequirements;
  selectedRoomId: string | null;
  startTime: string; // "HH:MM"
  endTime: string;
  nowTime: string;
  checked: boolean; // the user pressed "Check Availability" and nothing relevant changed since
}

export type CheckerAction =
  | { type: "setAttendees"; attendees: number }
  | { type: "toggleEquipment"; equipment: Equipment }
  | { type: "clearFilters" }
  | { type: "selectRoom"; roomId: string }
  | { type: "setTime"; field: TimeField; value: string }
  | { type: "check" };

export function createInitialState(rooms: readonly Room[]): CheckerState {
  return {
    requirements: emptyRequirements(),
    selectedRoomId: rooms[0]?.id ?? null,
    startTime: "14:00",
    endTime: "15:00",
    nowTime: timeInputValue(DEFAULT_NOW_MINUTES),
    checked: false,
  };
}

/** The ONLY place that implements "a previous result is no longer valid". */
function clearResult(state: CheckerState): CheckerState {
  return state.checked ? { ...state, checked: false } : state;
}

function applyRequirements(
  state: CheckerState,
  requirements: RoomRequirements,
  rooms: readonly Room[]
): CheckerState {
  const next = { ...state, requirements };
  const stillVisible = filterRooms(rooms, requirements).some((r) => r.id === state.selectedRoomId);
  return stillVisible ? next : clearResult({ ...next, selectedRoomId: null });
}

export function checkerReducer(
  state: CheckerState,
  action: CheckerAction,
  rooms: readonly Room[]
): CheckerState {
  switch (action.type) {
    case "setAttendees":
      return applyRequirements(state, { ...state.requirements, attendees: action.attendees }, rooms);
    case "toggleEquipment": {
      const has = state.requirements.equipment.includes(action.equipment);
      const equipment = has
        ? state.requirements.equipment.filter((e) => e !== action.equipment)
        : [...state.requirements.equipment, action.equipment];
      return applyRequirements(state, { ...state.requirements, equipment }, rooms);
    }
    case "clearFilters":
      return applyRequirements(state, emptyRequirements(), rooms);
    case "selectRoom": {
      // Only rooms that satisfy the current filters can be selected.
      const selectable = filterRooms(rooms, state.requirements).some((r) => r.id === action.roomId);
      // F5: `checked` is kept, so the result is re-derived for the NEW room (see selectResult).
      return selectable ? { ...state, selectedRoomId: action.roomId } : state;
    }
    case "setTime":
      return clearResult({ ...state, [action.field]: action.value });
    case "check":
      return { ...state, checked: true };
  }
}

export function selectVisibleRooms(state: CheckerState, rooms: readonly Room[]): Room[] {
  return filterRooms(rooms, state.requirements);
}

export function selectSelectedRoom(state: CheckerState, rooms: readonly Room[]): Room | null {
  return rooms.find((r) => r.id === state.selectedRoomId) ?? null;
}

/** Derived (never stored): switching the room after a check refreshes the result automatically (F5). */
export function selectResult(
  state: CheckerState,
  rooms: readonly Room[],
  bookings: Booking[]
): CheckResult | null {
  if (!state.checked) return null;
  const room = selectSelectedRoom(state, rooms);
  if (!room) return { ok: false, message: "Please select a room first.", reason: "no_room" };
  return checkAvailability(
    timeInputToMinutes(state.startTime),
    timeInputToMinutes(state.endTime),
    room,
    bookings,
    timeInputToMinutes(state.nowTime)
  );
}
