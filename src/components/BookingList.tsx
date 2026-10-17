import type { Booking } from "../types";
import type { Room } from "../types";
import { minutesToLabel } from "../timeUtils";
import { Calendar } from "lucide-react";

interface BookingListProps {
  room: Room | null;
  bookings: Booking[];
}

export function BookingList({ room, bookings }: BookingListProps) {
  const items = room ? bookings.filter((b) => b.roomId === room.id) : bookings;
  const sorted = [...items].sort((a, b) => a.start - b.start);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-semibold text-slate-700">
          Existing Bookings{room ? ` — ${room.name}` : " — All Rooms"}
        </h3>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No bookings to display.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{b.title}</p>
                <p className="text-xs text-slate-400 truncate">by {b.bookedBy}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1">
                {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
