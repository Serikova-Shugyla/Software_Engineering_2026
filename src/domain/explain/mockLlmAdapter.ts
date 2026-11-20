import { minutesToLabel } from "../time";
import type { ExplanationRequest, ExplanationResult } from "./types";

/**
 * Clearly labeled MOCK LLM adapter: deterministic template logic, no network,
 * no API key. It only rewords a decision that checkAvailability already made.
 */
export function mockLlmAdapter(req: ExplanationRequest): ExplanationResult {
  const from = minutesToLabel(req.startTime);
  const to = minutesToLabel(req.endTime);
  const room = req.roomLabel;

  let explanation: string;
  switch (req.reasonCode) {
    case "available":
      explanation = `${room} is free from ${from} to ${to}. No other booking overlaps this time and the room is not blocked.`;
      break;
    case "blocked":
      explanation = `${room} is unavailable from ${from} to ${to} because the room is blocked and cannot be booked at all.`;
      break;
    case "overlap":
      explanation = `${room} is unavailable from ${from} to ${to} because another booking overlaps this time.`;
      break;
    case "too_long":
      explanation = `${room} cannot be requested from ${from} to ${to} because the interval is longer than the 120-minute limit.`;
      break;
    case "past":
      explanation = `${room} cannot be requested from ${from} to ${to} because the start time is not after the current time.`;
      break;
    case "order":
      explanation = `${room} cannot be requested from ${from} to ${to} because the start time is not before the end time.`;
      break;
    case "range":
      explanation = `${room} cannot be requested from ${from} to ${to} because the time is outside the 00:00 to 24:00 day.`;
      break;
    case "invalid":
      explanation = `${room} cannot be checked because the time values are not valid.`;
      break;
  }

  return { explanation, source: "mock-llm" };
}
