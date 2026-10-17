import { useState, useMemo, useCallback } from "react";
import { SAMPLE_ROOMS, SAMPLE_BOOKINGS } from "./data";
import { RoomCard } from "./components/RoomCard";
import { Timeline } from "./components/Timeline";
import { BookingList } from "./components/BookingList";
import { ResultPanel } from "./components/ResultPanel";
import { checkAvailability, type CheckResult } from "./availability";
import { timeInputToMinutes, timeInputValue, getNowMinutes, minutesToLabel } from "./timeUtils";
import { Clock, Building2, Sparkles, Search } from "lucide-react";

function App() {
  const [bookings] = useState(SAMPLE_BOOKINGS);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>("r1");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");
  const [nowTime, setNowTime] = useState(timeInputValue(getNowMinutes()));
  const [result, setResult] = useState<CheckResult | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const selectedRoom = useMemo(
    () => SAMPLE_ROOMS.find((r) => r.id === selectedRoomId) ?? null,
    [selectedRoomId]
  );

  const nowMinutes = timeInputToMinutes(nowTime);
  const startMin = timeInputToMinutes(startTime);
  const endMin = timeInputToMinutes(endTime);

  const bookingCount = useCallback(
    (roomId: string) => bookings.filter((b) => b.roomId === roomId).length,
    [bookings]
  );

  const handleCheck = () => {
    setHasChecked(true);
    if (!selectedRoom) {
      setResult({ ok: false, message: "Please select a room first.", reason: "no_room" });
      return;
    }
    setResult(checkAvailability(startMin, endMin, selectedRoom, bookings, nowMinutes));
  };

  const onRoomSelect = (id: string) => {
    setSelectedRoomId(id);
    setHasChecked(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
              Smart Campus Room Checker
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Current time: {minutesToLabel(nowMinutes)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Rooms */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-700">Select a Room</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_ROOMS.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                selected={selectedRoomId === room.id}
                onClick={() => onRoomSelect(room.id)}
                bookingCount={bookingCount(room.id)}
              />
            ))}
          </div>
        </section>

        {/* Time + Check */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-700">Choose a Time Interval</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Current time
              </label>
              <input
                type="time"
                value={nowTime}
                onChange={(e) => { setNowTime(e.target.value); setHasChecked(false); setResult(null); }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Start time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setHasChecked(false); setResult(null); }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                End time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setHasChecked(false); setResult(null); }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={!selectedRoomId}
              className="w-full rounded-xl bg-teal-600 text-white font-semibold text-sm py-2.5 px-4 hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Check Availability
            </button>
          </div>

          {/* Duration hint */}
          {startMin >= 0 && endMin > startMin && (
            <p className="mt-3 text-xs text-slate-500">
              Duration: <span className="font-medium text-slate-700">{endMin - startMin} min</span>
              {endMin - startMin > 120 && (
                <span className="text-red-500 font-medium"> — exceeds the 120-minute limit</span>
              )}
            </p>
          )}
        </section>

        {/* Result */}
        {hasChecked && <ResultPanel result={result} />}

        {/* Timeline */}
        <Timeline
          room={selectedRoom}
          bookings={bookings}
          pendingStart={hasChecked ? startMin : null}
          pendingEnd={hasChecked ? endMin : null}
          nowMinutes={nowMinutes}
        />

        {/* Booking list */}
        <BookingList room={selectedRoom} bookings={bookings} />
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-xs text-slate-400 text-center">
          Fictional sample data for prototype demonstration. No real bookings are created.
        </p>
      </footer>
    </div>
  );
}

export default App;
