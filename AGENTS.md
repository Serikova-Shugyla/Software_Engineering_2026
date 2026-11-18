# Smart Campus Room Availability Checker

This React, TypeScript and Vite demo checks room availability against fictional, in-memory data. It does not create bookings. Keep the existing AC1–AC6 and filter behavior. Preserve layout, existing availability messages and fictional fixtures. Keep runtime scope to the local demo.

## Repository map

- `src/main.tsx` mounts `src/App.tsx`, which wires controls and state.
- `src/domain/` contains pure booking, filtering and time helpers.
- `src/state/checkerState.ts` contains the reducer and selectors. `src/components/` renders the UI.
- `src/data/` holds fictional fixtures. Keep `src/config.ts` as the source of business constants.
- Keep tests next to the logic they exercise. Do not remove or weaken existing assertions.

## Allowed local workflow

Use a dedicated task branch or worktree. Read `README.md` and inspect git status before editing. Run `npm ci` from the committed lockfile, `npm test`, `npm run typecheck`, `npm run lint` and `npm run build`. Use `npm run dev` or `npm run preview` for local smoke checks. Read-only inspection with `git status`, `git diff` and `git log` is permitted. Keep changes focused and prefer existing pure helpers over new abstractions.

## Prohibited operations and review gates

Do not access or commit credentials or real personal data. Do not deploy, force-push, rewrite history or run destructive commands. Leave dependency manifests and lockfiles alone unless a human explicitly authorizes and reviews a dependency change. Ask before expanding the agreed file scope. Before merge or deployment, provide the diff, rationale, actual command exits, test counts and known gaps for human review. Stop on unexpected changes or failed checks and report them.
