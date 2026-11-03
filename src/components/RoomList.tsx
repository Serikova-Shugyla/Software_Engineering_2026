import type { Booking, Room } from "../types";
import { getRoomBookings } from "../domain/bookings";
import { RoomCard } from "./RoomCard";
import { SearchX } from "lucide-react";

interface RoomListProps {
  rooms: Room[]; // already filtered
  bookings: Booking[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  onClearFilters: () => void;
}

export function RoomList({ rooms, bookings, selectedRoomId, onSelect, onClearFilters }: RoomListProps) {
  // F4: clear empty state
  if (rooms.length === 0) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"
      >
        <SearchX className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No rooms match your requirements.</p>
        <p className="text-xs text-slate-500 mt-1">
          Try a smaller group size or fewer equipment items.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 text-xs font-medium text-teal-700 hover:text-teal-900 underline-offset-2 hover:underline"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          selected={selectedRoomId === room.id}
          onClick={() => onSelect(room.id)}
          bookingCount={getRoomBookings(bookings, room.id).length}
        />
      ))}
    </div>
  );
}
