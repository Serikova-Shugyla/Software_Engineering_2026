## Project
Smart Campus room availability checker; 5 fictional rooms (one blocked), fixed current time 09:00.
React + TypeScript app. Booking rules: src/domain/availability.ts.
State: src/state/checkerState.ts. Data: src/data/*. Config: src/config.ts.

## Constraints
Preserve AC1–AC6; no backend, login or booking creation.
Do not change the visible UI, message texts or fixture data.

## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
Do not add new features or dependencies.

## Verification
Test: npm test (vitest run)
Typecheck: npm run typecheck
Lint: npm run lint
Build: npm run build
Run existing tests and add focused regression tests.
Do not weaken or delete existing assertions.
Report changed files, rationale and test evidence.