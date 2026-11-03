# Smart Campus Room Availability Checker (Assignment #04)

React + TypeScript + Vite + Tailwind prototype. **Fictional data only, no login, payments, live API or database.**
The checker answers one question: *"Is this room free for this time interval?"* — it never creates a booking (AC5).

## Setup, run, test

```bash
npm install          # once
npm run dev          # http://localhost:5173
npm test             # vitest run  (79 tests)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
node scripts/measure.mjs   # before/after quality measures (needs git + the v1-initial tag)
```

Windows PowerShell: if `npm` is blocked by the execution policy, run
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once.

To save test output as readable UTF-8 text (PowerShell's `Tee-Object` writes UTF-16 with colour codes):

```powershell
$env:NO_COLOR = 1; npm test 2>&1 | Out-File -Encoding utf8 report\final-test-output.txt
```

## Versions

| Git tag | Meaning |
|---|---|
| `v1-initial` | Practice #08 result (single room list, 48 tests passing) — the "before" version |
| `v2-final` | This assignment: catalog + filters + refactoring + 79 tests — the "after" version |

## Rules (acceptance criteria and new requirements)

| ID | Rule | Where implemented | Main tests |
|---|---|---|---|
| AC1 | Valid interval, not in the past | `src/domain/availability.ts` | `availability*.test.ts` (T02–T05, T15, R1–R4) |
| AC2 | Max 120 min (`MAX_BOOKING_MINUTES` in `src/config.ts`) | `availability.ts` (`exceedsMaxDuration`) | T06 (120 ok), T07 (121 rejected), R8 |
| AC3 / F3 | Blocked room is never Available | `availability.ts` | T13, R6, F3a, I4 |
| AC4 | Overlap rejected, touching allowed | `availability.ts` | T01, T08–T12, R5, R9 |
| AC5 | No mutation of bookings/rooms | all domain code is pure | AC5 group, B2, S6 |
| AC6 | Clear responsive feedback | `components/*` (Tailwind grid, `sm:`/`lg:`) | U1–U5 |
| F1 | capacity >= attendees | `src/domain/filter.ts` | F1a (exact), F1b, F1c |
| F2 | room has ALL selected equipment | `filter.ts` | F2a–F2e |
| F4 | clear empty state | `components/RoomList.tsx` | F4a, U1, S3 |
| F5 | changing the room refreshes the result | `src/state/checkerState.ts` (`selectResult` is derived) | F5a, I4 |

## Project structure

```
src/
  config.ts                 constants: 120 min, day bounds, fixed "now" = 09:00
  types.ts                  Room, Booking, Equipment, RoomRequirements
  data/                     rooms.ts (5 rooms), bookings.ts, equipment.ts
  domain/                   pure logic: availability.ts, filter.ts, bookings.ts, time.ts (+ unit tests)
  state/checkerState.ts     reducer + selectors (all UI behaviour, testable without a browser)
  components/               presentation only (RoomFilterPanel, RoomList, RoomCard, TimeField, ...)
  App.tsx                   wiring + layout
scripts/measure.mjs         reproducible before/after measures
report/                     analysis, diagrams, evidence, AI appendix
```

## Design decisions worth knowing

* **Bookings belong to rooms through `roomId`** and are read only via `getRoomBookings()` — one rule, so a check can never use another room's data.
* **Blocked rooms stay visible** if they match the filters (greyed, "Blocked" badge); a check on them always returns *Unavailable* (F3). Filters only look at capacity and equipment.
* **F5:** after a check, selecting another room immediately shows the result for the new room. Editing any time field clears the result (same as v1).
* **Fixed clock:** "current time" defaults to 09:00 (`DEFAULT_NOW_MINUTES`) instead of the real clock, so demos and tests are deterministic. It can still be edited in the UI.
* Attendees input: blank / invalid / negative = "no minimum".

## Known limitations

* Data lives in memory; nothing is saved and no booking can be created.
* Time is time-of-day only (no dates, one day).
* UI tests render markup (`react-dom/server`); real click-through behaviour is covered through the pure reducer plus manual checks, not a browser test runner.
* The timeline axis labels 24:00 as "12 PM" (pre-existing cosmetic issue in `Timeline.tsx`, deliberately not changed).
* `@supabase/supabase-js` is listed in `package.json` but imported nowhere (v1 and v2). Optional cleanup: `npm uninstall @supabase/supabase-js`.
