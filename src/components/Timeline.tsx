import type { Room, Booking } from "../types";
import { minutesToLabel, timeInputValue } from "../timeUtils";
import { Clock } from "lucide-react";

interface TimelineProps {
  room: Room | null;
  bookings: Booking[];
  pendingStart: number | null;
  pendingEnd: number | null;
  nowMinutes: number;
}

const DAY_START = 0;
const DAY_END = 1440;

export function Timeline({ room, bookings, pendingStart, pendingEnd, nowMinutes }: TimelineProps) {
  const range = DAY_END - DAY_START;
  const pct = (m: number) => ((m - DAY_START) / range) * 100;

  const roomBookings = room ? bookings.filter((b) => b.roomId === room.id) : [];

  const hours = [];
  for (let h = 0; h <= 24; h += 3) {
    hours.push(h * 60);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-semibold text-slate-700">
          Day Timeline{room ? ` — ${room.name}` : ""}
        </h3>
      </div>

      <div className="relative h-20 bg-slate-50 rounded-lg overflow-hidden">
        {/* Hour grid lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${pct(h)}%` }}
          >
            <span className="absolute bottom-0 -translate-x-1/2 text-[9px] text-slate-400 pb-0.5">
              {h === 0 ? "12 AM" : h === 720 ? "12 PM" : h < 720 ? `${h / 60} AM` : `${(h - 720) / 60} PM`}
            </span>
          </div>
        ))}

        {/* Existing bookings */}
        {roomBookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-2 bottom-5 rounded bg-slate-300 border border-slate-400 flex items-center justify-center overflow-hidden"
            style={{ left: `${pct(b.start)}%`, width: `${pct(b.end) - pct(b.start)}%` }}
            title={`${b.title}: ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
          >
            <span className="text-[8px] text-slate-600 font-medium truncate px-1">{b.title}</span>
          </div>
        ))}

        {/* Now indicator */}
        {nowMinutes >= DAY_START && nowMinutes <= DAY_END && (
          <div
            className="absolute top-0 bottom-0 w-px bg-orange-400 z-10"
            style={{ left: `${pct(nowMinutes)}%` }}
          >
            <span className="absolute -top-0 -translate-x-1/2 text-[8px] text-orange-500 font-semibold">
              NOW
            </span>
          </div>
        )}

        {/* Pending interval */}
        {pendingStart !== null && pendingEnd !== null && pendingStart < pendingEnd && (
          <div
            className="absolute top-2 bottom-5 rounded border-2 border-dashed border-teal-500 bg-teal-100/60 z-20 flex items-center justify-center"
            style={{ left: `${pct(pendingStart)}%`, width: `${pct(pendingEnd) - pct(pendingStart)}%` }}
          >
            <span className="text-[8px] text-teal-700 font-semibold truncate px-1">
              {minutesToLabel(pendingStart)}–{minutesToLabel(pendingEnd)}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-300 border border-slate-400" />
          Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded border-2 border-dashed border-teal-500 bg-teal-100/60" />
          Your interval
        </span>
        <span className="flex items-center gap-1">
          <span className="w-px h-3 bg-orange-400" />
          Current time
        </span>
      </div>
    </div>
  );
}
