import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RoomList } from "./RoomList";
import { RoomFilterPanel } from "./RoomFilterPanel";
import { ResultPanel } from "./ResultPanel";
import { SAMPLE_ROOMS } from "../data/rooms";
import { SAMPLE_BOOKINGS } from "../data/bookings";
import { emptyRequirements } from "../domain/filter";

const noop = () => {};

describe("UI behavior (rendered markup)", () => {
  it("U1 (F4): empty list renders the clear empty-state message and a reset button", () => {
    const html = renderToStaticMarkup(
      <RoomList rooms={[]} bookings={SAMPLE_BOOKINGS} selectedRoomId={null} onSelect={noop} onClearFilters={noop} />
    );
    expect(html).toContain("No rooms match your requirements.");
    expect(html).toContain("Clear filters");
    expect(html).toContain('role="status"');
  });

  it("U2: only the rooms passed in are rendered, the selected one is marked", () => {
    const visible = SAMPLE_ROOMS.filter((r) => r.id === "r1" || r.id === "r5");
    const html = renderToStaticMarkup(
      <RoomList rooms={visible} bookings={SAMPLE_BOOKINGS} selectedRoomId="r5" onSelect={noop} onClearFilters={noop} />
    );
    expect(html).toContain("Auditorium A");
    expect(html).toContain("Lecture Hall 3");
    expect(html).not.toContain("Lab 101");
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toContain("No rooms match");
  });

  it("U3 (F3): a blocked room is rendered with a visible Blocked badge", () => {
    const html = renderToStaticMarkup(
      <RoomList rooms={SAMPLE_ROOMS.filter((r) => r.blocked)} bookings={SAMPLE_BOOKINGS} selectedRoomId={null} onSelect={noop} onClearFilters={noop} />
    );
    expect(html).toContain("Blocked");
  });

  it("U4: filter panel shows match count and one checkbox per equipment option", () => {
    const html = renderToStaticMarkup(
      <RoomFilterPanel
        requirements={{ attendees: 30, equipment: ["projector"] }}
        matchCount={3}
        totalCount={5}
        onAttendeesChange={noop}
        onToggleEquipment={noop}
        onClear={noop}
      />
    );
    expect(html).toContain("Showing 3 of 5 rooms");
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(5);
    expect((html.match(/checked=""/g) ?? []).length).toBe(1);
    expect(html).toContain('value="30"');
    void emptyRequirements;
  });

  it("U5 (AC6): result panel shows clear Available / Unavailable feedback", () => {
    const ok = renderToStaticMarkup(<ResultPanel result={{ ok: true, message: "Room is free." }} />);
    const bad = renderToStaticMarkup(<ResultPanel result={{ ok: false, message: "Overlaps X.", reason: "overlap" }} />);
    expect(ok).toContain("Available");
    expect(ok).toContain("Room is free.");
    expect(bad).toContain("Unavailable");
    expect(bad).toContain("Overlaps X.");
  });
});
