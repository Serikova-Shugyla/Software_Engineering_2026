import { describe, it, expect } from "vitest";
import {
  explainAvailability,
  isValidExplanationRequest,
  sanitizeRoomLabel,
  mockLlmAdapter,
  type ExplanationRequest,
} from "./explain";

function makeRequest(overrides: Partial<ExplanationRequest> = {}): ExplanationRequest {
  return {
    roomLabel: "Lab 101",
    startTime: 600,
    endTime: 660,
    isAvailable: true,
    reasonCode: "available",
    ...overrides,
  };
}

describe("E1: input validation", () => {
  it("accepts a well-formed request", () => {
    expect(isValidExplanationRequest(makeRequest())).toBe(true);
  });

  it("rejects empty, malformed and out-of-range input", () => {
    expect(isValidExplanationRequest(null)).toBe(false);
    expect(isValidExplanationRequest(undefined)).toBe(false);
    expect(isValidExplanationRequest("text")).toBe(false);
    expect(isValidExplanationRequest(makeRequest({ roomLabel: "   " }))).toBe(false);
    expect(isValidExplanationRequest(makeRequest({ startTime: NaN }))).toBe(false);
    expect(isValidExplanationRequest(makeRequest({ startTime: 1.5 }))).toBe(false);
    expect(isValidExplanationRequest(makeRequest({ startTime: -1 }))).toBe(false);
    expect(isValidExplanationRequest(makeRequest({ endTime: 1441 }))).toBe(false);
    expect(isValidExplanationRequest(makeRequest({ endTime: 600 }))).toBe(false);
  });

  it("rejects a reasonCode outside the allowed set or inconsistent with isAvailable", () => {
    expect(
      isValidExplanationRequest(makeRequest({ reasonCode: "overlap" as never, isAvailable: true }))
    ).toBe(false);
    expect(
      isValidExplanationRequest(makeRequest({ reasonCode: "hacked" as never, isAvailable: false }))
    ).toBe(false);
    expect(
      isValidExplanationRequest(makeRequest({ reasonCode: "available", isAvailable: false }))
    ).toBe(false);
  });
});

describe("E2: mock LLM adapter", () => {
  it("is deterministic: same input gives the same output, no network needed", () => {
    const a = mockLlmAdapter(makeRequest());
    const b = mockLlmAdapter(makeRequest());
    expect(a).toEqual(b);
    expect(a.source).toBe("mock-llm");
  });

  it("agrees with the checker verdict for available and each rejection reason", () => {
    expect(mockLlmAdapter(makeRequest()).explanation).toContain("is free");
    expect(mockLlmAdapter(makeRequest({ isAvailable: false, reasonCode: "overlap" })).explanation).toContain(
      "unavailable"
    );
    expect(mockLlmAdapter(makeRequest({ isAvailable: false, reasonCode: "blocked" })).explanation).toContain(
      "blocked"
    );
    expect(mockLlmAdapter(makeRequest({ isAvailable: false, reasonCode: "too_long" })).explanation).toContain(
      "120-minute"
    );
    expect(mockLlmAdapter(makeRequest({ isAvailable: false, reasonCode: "past" })).explanation).toContain(
      "current time"
    );
  });
});

describe("E3: output validation and fallback", () => {
  it("truncates an overly long explanation at a sentence boundary", () => {
    const long = "x".repeat(300) + ". done";
    const outcome = explainAvailability(makeRequest(), () => ({
      explanation: long,
      source: "mock-llm",
    }));
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") expect(outcome.result.explanation.length).toBeLessThanOrEqual(280);
  });

  it("rejects an explanation that contradicts the verdict and uses the fallback", () => {
    const outcome = explainAvailability(makeRequest(), () => ({
      explanation: "This room is unavailable for your interval.",
      source: "mock-llm",
    }));
    expect(outcome.status).toBe("fallback");
    if (outcome.status === "fallback") expect(outcome.result.source).toBe("fallback");
  });

  it("handles a simulated API failure (throwing adapter) with the safe fallback", () => {
    const outcome = explainAvailability(makeRequest(), () => {
      throw new Error("simulated API failure");
    });
    expect(outcome.status).toBe("fallback");
    if (outcome.status === "fallback") {
      expect(outcome.result.explanation).toContain("not available right now");
      expect(outcome.result.explanation).toContain("Lab 101 is available");
    }
  });

  it("handles a malformed adapter response (empty text) with the safe fallback", () => {
    const outcome = explainAvailability(makeRequest(), () => ({
      explanation: "   ",
      source: "mock-llm",
    }));
    expect(outcome.status).toBe("fallback");
  });

  it("fallback never changes the verdict: it repeats the checker's decision", () => {
    const outcome = explainAvailability(makeRequest({ isAvailable: false, reasonCode: "overlap" }), () => {
      throw new Error("timeout");
    });
    if (outcome.status === "fallback") {
      expect(outcome.result.explanation).toContain("is not available");
    }
  });
});

describe("E4: overly long room label is sanitized", () => {
  it("truncates the label to 80 characters before use", () => {
    expect(sanitizeRoomLabel("  ab ".repeat(40)).length).toBeLessThanOrEqual(80);
    const long = "R".repeat(200);
    const outcome = explainAvailability(makeRequest({ roomLabel: long }));
    if (outcome.status === "ok") {
      expect(outcome.result.explanation).toContain("R".repeat(80));
      expect(outcome.result.explanation).not.toContain("R".repeat(81));
    } else {
      expect(outcome.result.explanation.length).toBeGreaterThan(0);
    }
  });
});
describe("Practice 11 regression fixes", () => {
  it("does not invent times for an invalid interval", () => {
    const outcome = explainAvailability(
      makeRequest({
        startTime: 900,
        endTime: 840,
        isAvailable: false,
        reasonCode: "order",
      })
    );

    expect(outcome.status).toBe("fallback");
    expect(outcome.result.explanation).not.toContain("9:00 AM");
    expect(outcome.result.explanation).toContain("invalid");
  });

  it("rejects overly long room labels", () => {
    expect(
      isValidExplanationRequest(
        makeRequest({ roomLabel: "R".repeat(81) })
      )
    ).toBe(false);
  });
});
