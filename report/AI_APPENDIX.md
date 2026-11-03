# AI evidence appendix — Assignment #04

**AI assistant used:** Claude (Anthropic) — Claude Sonnet 5.5, claude.ai chat with file/code tools · **Dates:** 2–3 November 2026
**Rule followed:** AI output was treated as a proposal; anything that affects the grade (test results, counts, git state) comes from commands whose output is stored in the repository.

## A. AI-use record

| # | Date | Prompt summary | Output used | Problems found | Changes made | Verification sources |
|---|---|---|---|---|---|---|
| 1 | 2 Nov | "Explain what Assignment #04 requires and how to do it" (attached the Assignment #04 and Practice #08 PDFs) | requirement checklist (AC1–AC6, F1–F5), 6-task work plan, test table, deadline plan, submission rules | Example code in the first answer was JavaScript with a different `checkAvailability(room, start, end, now)` signature and string times; it did not fit my TypeScript project. A `find src -type f` command did not work in PowerShell | I discarded the example code and kept the real signature; the PowerShell command was replaced by `Get-ChildItem` | read the real files; compared the PDFs' wording with the plan |
| 2 | 2 Nov | "Look at my GitHub repo / Bolt project and tell me what to do next" | observation that Vitest was installed but `package.json` had no `test` script; dependency on Supabase although the task forbids a database | Claude could not read `src/` on GitHub (blocked) and could not open Bolt, so it only saw `package.json` | I added `"test": "vitest run"` myself | my own `package.json`; `grep supabase src` → no imports |
| 3 | 2 Nov | Setup help: `npm install` failed with *running scripts is disabled* | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` | none | ran it; `npm install` and `npm run dev` then worked | my terminal screenshot; site opened on localhost |
| 4 | 2 Nov | "tag v1-initial already exists" | commands to check which commit the tag points to | none | confirmed tag = commit `9030a47` (= `origin/main` at the time), pushed to GitHub | my `git log --decorate` and `git ls-remote --tags` screenshot |
| 5 | 3 Nov | "Do the whole assignment for me, ask only for screenshots / code you cannot get" (attached the zipped project) | Claude read all sources; made the improvement plan (P1–P5); refactored (config, domain, data, state, components); added 5-room catalog, F1–F5 UI; wrote 31 new tests; ran mutation checks; wrote `scripts/measure.mjs`; produced screenshots, diagrams, README, report | (a) The AI sandbox had only Windows binaries of Vite/Vitest and no network, so real `npm test` could not run there; (b) my first stand-in test runner reported 0 tests (module state was not shared) and had to be fixed; (c) `report/baseline-test-output.txt` is UTF-16 with colour codes (PowerShell `Tee-Object`) and had to be decoded; (d) 24:00 axis label bug in `Timeline.tsx` found | (a) used a stand-in runner and labelled every result from it "AI sandbox pre-check"; (b) fixed; verified it reproduces my real baseline 19 + 29 = 48; (c) README now gives a UTF-8 command; (d) documented, not changed | stand-in runner reproducing baseline 48/48; `tsc --noEmit`, `eslint .`; `git grep` metrics; Playwright run of the bundled app; 9 injected bugs all detected; **my own `npm test` output (`report/final-test-output.txt`)** |

## B. Selected prompts (verbatim summaries)

1. *"Context: React+TS room checker, constraints… Task: identify ≥ 3 maintainability risks with file/function references, then propose a prioritized improvement plan. Do NOT rewrite the code yet."* → produced R1–R6 in `REPORT.md` §1.2; every file:line reference was re-checked with `git show v1-initial:<file>`.
2. *"Do one change at a time and rerun the 48 tests after each."* → step A (pure refactor) ended with 48/48 before any feature was added (`evidence/ai-sandbox-step-A-pure-refactor.txt`).
3. *"Inject deliberate bugs to check that the new tests would catch them."* → nine mutations, all detected (`evidence/ai-sandbox-mutation-results.txt`).

## C. Useful vs. incorrect AI output

| Useful | Incorrect / changed |
|---|---|
| Finding duplicated rules (120, room filter ×4, reset ×4, class string ×3) | First-guide code did not match the real TypeScript signature (rejected) |
| Reducer + derived result design for F5 | Suggestion to test the UI with jsdom (replaced by `react-dom/server` markup tests; no new dependency) |
| Boundary-focused test list (120/121, touching/overlap, exact capacity) | PowerShell command copied from a Unix idiom (fixed) |

## D. Human review

| Item | Status / evidence |
|---|---|
| Baseline reproduced on my machine (48/48), tag `v1-initial` created and pushed | done — `report/baseline-test-output.txt`, git screenshot |
| Final `npm test` run on my machine | `report/final-test-output.txt` (official evidence; must show 79 passed) |
| UI checked in the browser (`npm run dev`) incl. mobile width | compare with `report/screenshots/*.png` |
| Diff of the two original test files reviewed (import path + one fixture line only) | `git diff -M v1-initial -- src/domain/availability*.test.ts` |
| Report numbers regenerated | `node scripts/measure.mjs` |

## E. Not verified by the AI (stated honestly)

* The final Vitest run on Windows (only a stand-in runner was available to the AI).
* The Vite production build (`npm run build`): not executed in the AI sandbox; the app was bundled with esbuild for screenshots instead.
