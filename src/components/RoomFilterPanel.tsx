import type { Equipment, RoomRequirements } from "../types";
import { EQUIPMENT_OPTIONS } from "../data/equipment";
import { INPUT_CLASS } from "./styles";
import { SlidersHorizontal } from "lucide-react";

interface RoomFilterPanelProps {
  requirements: RoomRequirements;
  matchCount: number;
  totalCount: number;
  onAttendeesChange: (raw: string) => void;
  onToggleEquipment: (equipment: Equipment) => void;
  onClear: () => void;
}

export function RoomFilterPanel({
  requirements,
  matchCount,
  totalCount,
  onAttendeesChange,
  onToggleEquipment,
  onClear,
}: RoomFilterPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Room requirements">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-semibold text-slate-700">Room Requirements</h2>
        </div>
        <p className="text-xs text-slate-500" role="status">
          Showing {matchCount} of {totalCount} rooms
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Attendees (minimum capacity)
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Any"
              value={requirements.attendees === 0 ? "" : requirements.attendees}
              onChange={(e) => onAttendeesChange(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5 font-normal`}
            />
          </label>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="block text-xs font-medium text-slate-600 mb-1.5">
            Required equipment (room must have all selected)
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={requirements.equipment.includes(opt.id)}
                  onChange={() => onToggleEquipment(opt.id)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-xs font-medium text-teal-700 hover:text-teal-900 underline-offset-2 hover:underline"
      >
        Clear filters
      </button>
    </section>
  );
}
