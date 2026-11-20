import type { CheckResult } from "../domain/availability";
import type { ExplanationRequest } from "../domain/explain/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { ExplanationSection } from "./ExplanationSection";

interface ResultPanelProps {
  result: CheckResult | null;
  /** Present only for real checker verdicts; enables the optional explanation section. */
  explanationRequest?: ExplanationRequest | null;
  /** Changes whenever the confirmed check changes, clearing outdated explanations. */
  explanationKey?: string;
}

export function ResultPanel({ result, explanationRequest, explanationKey }: ResultPanelProps) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <p className="text-sm text-slate-400">
          Select a room and time range to check availability.
        </p>
      </div>
    );
  }

  if (result.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3 animate-fadeIn">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-semibold text-emerald-800">Available</p>
          <p className="text-sm text-emerald-700 mt-0.5">{result.message}</p>
          <p className="text-xs text-emerald-500 mt-1">
            No booking was created — this is a check only.
          </p>
          {explanationRequest && (
            <ExplanationSection
              request={explanationRequest}
              explanationKey={explanationKey ?? ""}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3 animate-fadeIn">
      <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="font-semibold text-red-800">Unavailable</p>
        <p className="text-sm text-red-700 mt-0.5">{result.message}</p>
        <p className="text-xs text-red-400 mt-1">Reason: {result.reason}</p>
        {explanationRequest && (
          <ExplanationSection
            request={explanationRequest}
            explanationKey={explanationKey ?? ""}
          />
        )}
      </div>
    </div>
  );
}
