import { describe, expect, it } from "vitest";
import { minutesToLabel, timeInputToMinutes } from "./time";

describe("minutesToLabel", () => {
  it("uses a placeholder when the current time input is cleared", () => {
    expect(minutesToLabel(timeInputToMinutes(""))).toBe("—");
  });

  it("distinguishes noon from the end-of-day midnight", () => {
    expect(minutesToLabel(720)).toBe("12:00 PM");
    expect(minutesToLabel(1440)).toBe("12:00 AM");
  });
});
