import { describe, it, expect } from "vitest";
import {
  checkerReducer,
  createInitialState,
  selectResult,
  selectSelectedRoom,
  selectVisibleRooms,
  type CheckerAction,
  type CheckerState,
} from "./checkerState";
import { SAMPLE_ROOMS } from "../data/rooms";
import { SAMPLE_BOOKINGS } from "../data/bookings";

const run = (s: CheckerState, ...actions: CheckerAction[]) =>
  actions.reduce((acc, a) => checkerReducer(acc, a, SAMPLE_ROOMS), s);
const visibleIds = (s: CheckerState) => selectVisibleRooms(s, SAMPLE_ROOMS).map((r) => r.id);
const result = (s: CheckerState) => selectResult(s, SAMPLE_ROOMS, SAMPLE_BOOKINGS);

describe("integration: filter -> select -> check -> switch room", () => {
  it("I1: initial state uses the fixed clock (09:00), selects the first room, shows no result", () => {
    const s = createInitialState(SAMPLE_ROOMS);
    expect(s.nowTime).toBe("09:00");
    expect(s.selectedRoomId).toBe("r1");
    expect(s.checked).toBe(false);
    expect(result(s)).toBeNull();
  });

  it("I2: full successful flow (filter, select, set time, check -> Available)", () => {
    const s = run(
      createInitialState(SAMPLE_ROOMS),
      { type: "setAttendees", attendees: 100 },
      { type: "toggleEquipment", equipment: "microphone" },
      { type: "selectRoom", roomId: "r5" },
      { type: "setTime", field: "startTime", value: "10:00" },
      { type: "setTime", field: "endTime", value: "11:00" },
      { type: "check" }
    );
    expect(visibleIds(s)).toEqual(["r1", "r5"]);
    expect(selectSelectedRoom(s, SAMPLE_ROOMS)?.id).toBe("r5");
    const r = result(s);
    expect(r?.ok).toBe(true);
  });

  it("I3: unsuccessful flow (overlap with the chosen room's booking -> Unavailable)", () => {
    const s = run(
      createInitialState(SAMPLE_ROOMS), // r1 selected, booking 09:00-10:30
      { type: "setTime", field: "startTime", value: "10:00" },
      { type: "setTime", field: "endTime", value: "11:00" },
      { type: "check" }
    );
    const r = result(s);
    expect(r?.ok).toBe(false);
    if (r && r.ok === false) expect(r.reason).toBe("overlap");
  });

  it("I4 (F5): switching rooms after a check refreshes the result for the NEW room", () => {
    const checked = run(
      createInitialState(SAMPLE_ROOMS),
      { type: "setTime", field: "startTime", value: "09:30" },
      { type: "setTime", field: "endTime", value: "10:00" },
      { type: "check" }
    ); // r1: overlaps Intro to CS
    const first = result(checked);
    expect(first?.ok).toBe(false);
    const switched = run(checked, { type: "selectRoom", roomId: "r2" }); // r2: only touches at 10:00
    expect(switched.checked).toBe(true);
    expect(result(switched)?.ok).toBe(true);
    const blocked = run(switched, { type: "selectRoom", roomId: "r4" });
    const rb = result(blocked);
    expect(rb?.ok).toBe(false);
    if (rb && rb.ok === false) expect(rb.reason).toBe("blocked");
  });

  it("I5: changing a time field clears the previous result", () => {
    const s = run(
      createInitialState(SAMPLE_ROOMS),
      { type: "check" },
      { type: "setTime", field: "endTime", value: "16:00" }
    );
    expect(s.checked).toBe(false);
    expect(result(s)).toBeNull();
  });
});

describe("integration: filters vs selection (F1, F2, F4)", () => {
  it("S1: a filter that excludes the selected room clears selection and result", () => {
    const s = run(
      createInitialState(SAMPLE_ROOMS),
      { type: "check" },
      { type: "toggleEquipment", equipment: "computers" } // only r2 has computers
    );
    expect(visibleIds(s)).toEqual(["r2"]);
    expect(s.selectedRoomId).toBeNull();
    expect(s.checked).toBe(false);
  });

  it("S2: a room hidden by the filters cannot be selected", () => {
    const s = run(
      createInitialState(SAMPLE_ROOMS),
      { type: "setAttendees", attendees: 100 },
      { type: "selectRoom", roomId: "r3" } // 12 seats, hidden
    );
    expect(s.selectedRoomId).toBe("r1");
  });

  it("S3 (F4): impossible requirements give an empty list; clearFilters restores all rooms", () => {
    const empty = run(createInitialState(SAMPLE_ROOMS), { type: "setAttendees", attendees: 999 });
    expect(visibleIds(empty)).toEqual([]);
    expect(empty.selectedRoomId).toBeNull();
    const restored = run(empty, { type: "clearFilters" });
    expect(visibleIds(restored)).toEqual(SAMPLE_ROOMS.map((r) => r.id));
  });

  it("S4: toggling the same equipment twice returns to the original filter", () => {
    const s = run(
      createInitialState(SAMPLE_ROOMS),
      { type: "toggleEquipment", equipment: "projector" },
      { type: "toggleEquipment", equipment: "projector" }
    );
    expect(s.requirements.equipment).toEqual([]);
  });

  it("S5: check with no selected room reports a clear error instead of crashing", () => {
    const s = run(
      createInitialState(SAMPLE_ROOMS),
      { type: "setAttendees", attendees: 999 },
      { type: "check" }
    );
    const r = result(s);
    expect(r?.ok).toBe(false);
    if (r && r.ok === false) expect(r.reason).toBe("no_room");
  });

  it("S6: reducer never mutates the data it reads (AC5)", () => {
    const roomsBefore = JSON.stringify(SAMPLE_ROOMS);
    const bookingsBefore = JSON.stringify(SAMPLE_BOOKINGS);
    run(
      createInitialState(SAMPLE_ROOMS),
      { type: "setAttendees", attendees: 30 },
      { type: "check" },
      { type: "selectRoom", roomId: "r2" }
    );
    result(createInitialState(SAMPLE_ROOMS));
    expect(JSON.stringify(SAMPLE_ROOMS)).toBe(roomsBefore);
    expect(JSON.stringify(SAMPLE_BOOKINGS)).toBe(bookingsBefore);
  });
});
