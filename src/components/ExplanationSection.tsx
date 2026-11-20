import { useEffect, useState } from "react";
import { explainAvailability } from "../domain/explain/explain";
import type { ExplanationRequest, ExplanationResult } from "../domain/explain/types";
import { Sparkles, ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";

interface ExplanationSectionProps {
  /** Changes whenever the confirmed check changes (room, time or new check) — outdated explanations are discarded. */
  explanationKey: string;
  request: ExplanationRequest | null;
}

type ViewState =
  | { phase: "hidden" }
  | { phase: "expanded" }
  | { phase: "loading" }
  | { phase: "done"; result: ExplanationResult };

export function ExplanationSection({ explanationKey, request }: ExplanationSectionProps) {
  const [view, setView] = useState<ViewState>({ phase: "hidden" });

  // Requirement 7: room or time change => outdated explanation is cleared and the section collapses.
  useEffect(() => {
    setView({ phase: "hidden" });
  }, [explanationKey]);

  if (!request || view.phase === "hidden") {
    return (
      <button
        type="button"
        onClick={() => {
          setView({ phase: "loading" });
          // The mock adapter is synchronous; the timeout keeps the loading state visible (requirement 7).
          window.setTimeout(() => {
            setView((current) =>
              current.phase === "loading"
                ? { phase: "done", result: explainAvailability(request!).result }
                : current
            );
          }, 400);
        }}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-600 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Explain availability (AI — mock)
      </button>
    );
  }

  if (view.phase === "loading" || view.phase === "expanded") {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400" aria-live="polite">
        <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
        Preparing explanation…
        <button
          type="button"
          onClick={() => setView({ phase: "hidden" })}
          className="ml-1 text-slate-400 hover:text-slate-600"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const { explanation, source } = view.result;
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white/70 p-3 animate-fadeIn">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Explanation {source === "fallback" ? "(generic fallback)" : "(AI — mock)"}
        </p>
        <button
          type="button"
          onClick={() => setView({ phase: "hidden" })}
          aria-label="Hide explanation"
          className="text-slate-400 hover:text-slate-600"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{explanation}</p>
    </div>
  );
}
