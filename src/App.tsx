import { useReducer } from "react";
import { SAMPLE_ROOMS } from "./data/rooms";
import { SAMPLE_BOOKINGS } from "./data/bookings";
import { RoomList } from "./components/RoomList";
import { RoomFilterPanel } from "./components/RoomFilterPanel";
import { TimeField } from "./components/TimeField";
import { Timeline } from "./components/Timeline";
import { BookingList } from "./components/BookingList";
import { ResultPanel } from "./components/ResultPanel";
import { exceedsMaxDuration } from "./domain/availability";
import { parseAttendees } from "./domain/filter";
import { timeInputToMinutes, minutesToLabel } from "./domain/time";
import { MAX_BOOKING_MINUTES } from "./config";
import {
  checkerReducer,
  createInitialState,
  selectResult,
  selectSelectedRoom,
  selectVisibleRooms,
  type CheckerAction,
  type CheckerState,
} from "./state/checkerState";
import { Clock, Building2, Sparkles, Search } from "lucide-react";

const reduce = (state: CheckerState, action: CheckerAction) =>
  checkerReducer(state, action, SAMPLE_ROOMS);

function App() {
  const [state, dispatch] = useReducer(reduce, SAMPLE_ROOMS, createInitialState);

  const visibleRooms = selectVisibleRooms(state, SAMPLE_ROOMS);
  const selectedRoom = selectSelectedRoom(state, SAMPLE_ROOMS);
  const result = selectResult(state, SAMPLE_ROOMS, SAMPLE_BOOKINGS);

  const nowMinutes = timeInputToMinutes(state.nowTime);
  const startMin = timeInputToMinutes(state.startTime);
  const endMin = timeInputToMinutes(state.endTime);

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
        {/* Requirements (F1, F2) */}
        <RoomFilterPanel
          requirements={state.requirements}
          matchCount={visibleRooms.length}
          totalCount={SAMPLE_ROOMS.length}
          onAttendeesChange={(raw) =>
            dispatch({ type: "setAttendees", attendees: parseAttendees(raw) })
          }
          onToggleEquipment={(equipment) => dispatch({ type: "toggleEquipment", equipment })}
          onClear={() => dispatch({ type: "clearFilters" })}
        />

        {/* Rooms */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-700">Select a Room</h2>
          </div>
          <RoomList
            rooms={visibleRooms}
            bookings={SAMPLE_BOOKINGS}
            selectedRoomId={state.selectedRoomId}
            onSelect={(roomId) => dispatch({ type: "selectRoom", roomId })}
            onClearFilters={() => dispatch({ type: "clearFilters" })}
          />
        </section>

        {/* Time + Check */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-700">Choose a Time Interval</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <TimeField
              label="Current time"
              value={state.nowTime}
              onChange={(value) => dispatch({ type: "setTime", field: "nowTime", value })}
            />
            <TimeField
              label="Start time"
              value={state.startTime}
              onChange={(value) => dispatch({ type: "setTime", field: "startTime", value })}
            />
            <TimeField
              label="End time"
              value={state.endTime}
              onChange={(value) => dispatch({ type: "setTime", field: "endTime", value })}
            />
            <button
              onClick={() => dispatch({ type: "check" })}
              disabled={!selectedRoom}
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
              {exceedsMaxDuration(startMin, endMin) && (
                <span className="text-red-500 font-medium">
                  {" "}— exceeds the {MAX_BOOKING_MINUTES}-minute limit
                </span>
              )}
            </p>
          )}
        </section>

        {/* Result */}
        {state.checked && <ResultPanel result={result} />}

        {/* Timeline */}
        <Timeline
          room={selectedRoom}
          bookings={SAMPLE_BOOKINGS}
          pendingStart={state.checked ? startMin : null}
          pendingEnd={state.checked ? endMin : null}
          nowMinutes={nowMinutes}
        />

        {/* Booking list */}
        <BookingList room={selectedRoom} bookings={SAMPLE_BOOKINGS} />
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
