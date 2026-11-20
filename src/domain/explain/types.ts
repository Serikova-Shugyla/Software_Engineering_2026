export const EXPLANATION_REASON_CODES = [
  "available",
  "invalid",
  "range",
  "order",
  "past",
  "too_long",
  "blocked",
  "overlap",
] as const;

export type ExplanationReasonCode = (typeof EXPLANATION_REASON_CODES)[number];

export interface ExplanationRequest {
  roomLabel: string;
  startTime: number;
  endTime: number;
  isAvailable: boolean;
  reasonCode: ExplanationReasonCode;
}

export interface ExplanationResult {
  explanation: string;
  source: "mock-llm" | "fallback";
}
