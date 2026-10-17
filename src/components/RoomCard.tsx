import type { Room } from "../types";
import { MapPin, Users, Lock } from "lucide-react";

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onClick: () => void;
  bookingCount: number;
}

export function RoomCard({ room, selected, onClick, bookingCount }: RoomCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border p-4 transition-all duration-200",
        selected
          ? "border-teal-500 bg-teal-50 shadow-md ring-1 ring-teal-300"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
        room.blocked ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{room.name}</p>
          <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3 h-3" />
            {room.building}
          </p>
        </div>
        {room.blocked && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            Blocked
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {room.capacity} seats
        </span>
        <span className="text-slate-300">|</span>
        <span>{bookingCount} booking{bookingCount !== 1 ? "s" : ""}</span>
      </div>
    </button>
  );
}
