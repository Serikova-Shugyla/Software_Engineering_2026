import { minutesToLabel } from "../time";
import { mockLlmAdapter } from "./mockLlmAdapter";
import {
  EXPLANATION_REASON_CODES,
  type ExplanationReasonCode,
  type ExplanationRequest,
  type ExplanationResult,
} from "./types";

export { EXPLANATION_REASON_CODES, type ExplanationReasonCode, type ExplanationRequest, type ExplanationResult } from "./types";
export { mockLlmAdapter } from "./mockLlmAdapter";

const MAX_ROOM_LABEL = 80;
const MAX_EXPLANATION = 280;

const OPPOSITE_VERDICT: Record<ExplanationReasonCode, RegExp> = {
  available: /unavailable|not available|cannot be/i,
  invalid: /\bis available\b/i,
  range: /\bis available\b/i,
  order: /\bis available\b/i,
  past: /\bis available\b/i,
  too_long: /\bis available\b/i,
  blocked: /\bis available\b/i,
  overlap: /\bis available\b/i,
};

export function isValidExplanationRequest(req: unknown): req is ExplanationRequest {
  if (typeof req !== "object" || req === null) return false;
  const r = req as Record<string, unknown>;
  if (typeof r.roomLabel !== "string") return false;
  if (r.roomLabel.trim().length === 0) return false;
  if (!Number.isInteger(r.startTime) || !Number.isInteger(r.endTime)) return false;
  if (typeof r.isAvailable !== "boolean") return false;
  if (typeof r.reasonCode !== "string") return false;
  if (!EXPLANATION_REASON_CODES.includes(r.reasonCode as ExplanationReasonCode)) return false;
  const { startTime, endTime } = r as unknown as ExplanationRequest;
  if (startTime < 0 || endTime > 1440 || startTime >= endTime) return false;
  const isAvailableCode = r.reasonCode === "available";
  return isAvailableCode === r.isAvailable;
}

export function sanitizeRoomLabel(raw: string): string {
  return raw.trim().slice(0, MAX_ROOM_LABEL);
}

export function fallbackExplanation(req: ExplanationRequest): ExplanationResult {
  const verdict = req.isAvailable ? "is available" : "is not available";
  const explanation =
    `Automated explanation is not available right now. The check itself is reliable: ` +
    `${req.roomLabel} ${verdict} for ${minutesToLabel(req.startTime)}–${minutesToLabel(req.endTime)}.`;
  return { explanation, source: "fallback" };
}

function truncateAtSentence(text: string): string {
  if (text.length <= MAX_EXPLANATION) return text;
  const cut = text.slice(0, MAX_EXPLANATION);
  const lastStop = cut.lastIndexOf(". ");
  const sentence = lastStop > 0 ? cut.slice(0, lastStop + 1) : cut.slice(0, MAX_EXPLANATION - 1).trimEnd() + "…";
  return sentence.length <= MAX_EXPLANATION ? sentence : cut.trimEnd() + "…";
}

function validateOutput(result: ExplanationResult, req: ExplanationRequest): ExplanationResult | null {
  if (typeof result?.explanation !== "string" || result.explanation.trim().length === 0) {
    return null;
  }
  if (OPPOSITE_VERDICT[req.reasonCode].test(result.explanation)) return null;
  return { explanation: truncateAtSentence(result.explanation), source: result.source };
}

export type ExplanationOutcome =
  | { status: "ok"; result: ExplanationResult }
  | { status: "fallback"; result: ExplanationResult };

/**
 * Pure orchestration: validate input -> mock adapter (mock mode only) -> validate output,
 * with a safe fallback for invalid input, adapter failure, timeout or unavailable key.
 */
export function explainAvailability(
  req: ExplanationRequest,
  adapter: (req: ExplanationRequest) => ExplanationResult = mockLlmAdapter
): ExplanationOutcome {
  if (!isValidExplanationRequest(req)) {
    const safe: ExplanationRequest = {
      roomLabel: "This room",
      startTime: 540,
      endTime: 600,
      isAvailable: false,
      reasonCode: "invalid",
    };
    if (req && typeof req === "object" && typeof (req as { roomLabel?: unknown }).roomLabel === "string") {
      safe.roomLabel = sanitizeRoomLabel((req as { roomLabel: string }).roomLabel) || safe.roomLabel;
    }
    return { status: "fallback", result: fallbackExplanation(safe) };
  }
  const clean: ExplanationRequest = { ...req, roomLabel: sanitizeRoomLabel(req.roomLabel) };
  try {
    const raw = adapter(clean);
    const validated = validateOutput(raw, clean);
    if (validated) return { status: "ok", result: validated };
  } catch {
    // simulated API failure, timeout or unavailable key — fall through to the safe fallback
  }
  return { status: "fallback", result: fallbackExplanation(clean) };
}
