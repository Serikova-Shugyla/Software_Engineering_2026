import type { CheckResult } from "../availability";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResultPanelProps {
  result: CheckResult | null;
}

export function ResultPanel({ result }: ResultPanelProps) {
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
        <div>
          <p className="font-semibold text-emerald-800">Available</p>
          <p className="text-sm text-emerald-700 mt-0.5">{result.message}</p>
          <p className="text-xs text-emerald-500 mt-1">
            No booking was created — this is a check only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3 animate-fadeIn">
      <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-800">Unavailable</p>
        <p className="text-sm text-red-700 mt-0.5">{result.message}</p>
        <p className="text-xs text-red-400 mt-1">Reason: {result.reason}</p>
      </div>
    </div>
  );
}
