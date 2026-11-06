import { describe, it, expect } from "vitest";
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

describe("booking message wording", () => {
  it("M1: validation messages keep their exact text", () => {
    expect(invalidTimeMessage()).toBe("Invalid time values.");
    expect(rangeMessage()).toBe("Time must be between 00:00 and 24:00.");
    expect(orderMessage()).toBe("Start time must be before end time.");
    expect(tooLongMessage()).toBe("Bookings may not exceed 120 minutes.");
  });

  it("M2: past-time message shows the current time label", () => {
    expect(pastMessage(540)).toBe("Start time must be after the current time (9:00 AM).");
  });

  it("M3: blocked message names the room", () => {
    expect(blockedMessage("Conference B")).toBe(
      '"Conference B" is currently blocked and cannot be booked.'
    );
  });

  it("M4: overlap message names the booking and its interval", () => {
    expect(overlapMessage("Intro to CS", 540, 630)).toBe(
      'Overlaps "Intro to CS" (9:00 AM–10:30 AM).'
    );
  });

  it("M5: available message names the room and interval", () => {
    expect(availableMessage("Lab 101", 600, 660)).toBe(
      '"Lab 101" is available for 10:00 AM–11:00 AM.'
    );
  });
});
