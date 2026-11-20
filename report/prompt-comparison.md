# Prompt Engineering Report — "Explain availability" (Practice #11, Task #04)

Companion to `report/feature-spec-explain-availability.md`. Prompt design and comparison
only — no booking rule, message, fixture, test or app code was changed.

## 1. Shared structured availability input (used for all three prompts)

This is the `ExplanationRequest` contract from Task #02, serialized as JSON. It is produced
exclusively from the confirmed output of the deterministic `checkAvailability` function.

```json
{
  "roomLabel": "Lab 101",
  "startTime": 600,
  "endTime": 660,
  "isAvailable": false,
  "reasonCode": "overlap"
}
```

Plus, as extra context supplied by the checker (fact base the LLM may use — nothing else):

```json
{
  "conflictingBooking": { "title": "Physics Lab", "start": 570, "end": 640 },
  "maxBookingMinutes": 120,
  "dayBounds": { "start": 0, "end": 1440 }
}
```

## 2. The three prompts

### P1 — Basic prompt

```
Explain to a student why Lab 101 is not available from 10:00 AM to 11:00 AM.
```

Sample output (simulated mock run):

> "Lab 101 is not available between 10:00 AM and 11:00 AM. Something seems to be already
> booked at that time, and rooms can also be blocked or have other restrictions."

### P2 — Structured prompt

```
You explain room availability to students.
Input (JSON): {"roomLabel":"Lab 101","startTime":600,"endTime":660,
               "isAvailable":false,"reasonCode":"overlap",
               "conflictingBooking":{"title":"Physics Lab","start":570,"end":640}}
Write 1–2 short sentences.
Cover exactly: room, time interval, verdict (available/unavailable), and the reason
that matches reasonCode ("overlap" = another booking overlaps the interval).
Mention the conflicting booking title and its time only if present in the input.
```

Sample output (simulated mock run):

> "Lab 101 is unavailable from 10:00 AM to 11:00 AM because the room is already booked for
> Physics Lab (9:30 AM–10:40 AM) at that time."

### P3 — Restricted prompt

```
System instruction (see §4) applies. Additionally:
- Output ONLY JSON: {"explanation": string}
- Use only the fields of the input JSON. Do not add causes that are not in reasonCode.
- 1–2 sentences, plain language, no advice, no room suggestions, no booking instructions.
```

Sample output (simulated mock run):

> {"explanation": "Lab 101 is not available from 10:00 AM to 11:00 AM because another
> booking overlaps this time."}

## 3. Comparison

Criteria: **Clarity** (understandable to a student), **Consistency** (same shape every run),
**Factual agreement** (matches the checker verdict and input facts), **Unsupported claims**
(lower is better; anything not in the input counts as unsupported).

| Criterion | P1 Basic | P2 Structured | P3 Restricted |
|---|---|---|---|
| Clarity | Medium — readable but vague ("something seems to be booked") | High — names room, time, and the actual conflict | High — short and plain, slightly drier |
| Consistency | Low — free-form, structure varies run to run | Medium — sentence pattern stable, extra details vary | High — fixed JSON schema, stable length |
| Factual agreement | Weak — verdict usually correct but reasons are guesses | Strong — verdict and reason both grounded | Strong — verdict and reason both grounded |
| Unsupported claims | Several: implies "maybe blocked or other restrictions" not in input; hedges ("seems") | Few: booking title/time are grounded in input; minor risk if the adapter output drifts | None observed: cannot add causes outside reasonCode by construction |

**Decision.** P3 (restricted prompt) is the basis for production behavior, with P2's
sentence shape as the quality target. P1 is rejected: its hedges and speculative reasons
are exactly the "unsupported claims" the feature must avoid, and the deterministic checker's
whole point is that the reason is known (`reasonCode`), not guessed. The restricted prompt
also matches the machine-checked output validation from Task #03 (JSON with an
`explanation` field, verdict-agreement check, length cap).

## 4. Final system instruction

This is the system instruction for the Explain availability feature (used by any real LLM
adapter; the current mock adapter implements the same rules in template code):

```
You explain room availability decisions to students.
You receive one JSON object with the confirmed decision:
roomLabel, startTime, endTime (minutes since 00:00), isAvailable, reasonCode, and
optional context fields. Rules:
1. Use at most two sentences.
2. Use only the facts supplied in the input; do not invent booking details, names,
   times, causes or policies that are not present.
3. The availability verdict in your explanation must always match isAvailable.
   You may never override, soften or question the confirmed status.
4. Return only JSON: {"explanation": "<your explanation>"}
```

Rule mapping to the Task #02 acceptance criteria: rule 1+4 keep the output machine-checkable
(AC-E3/E4), rule 2 eliminates unsupported claims (AC-E2), rule 3 enforces that the
deterministic checker remains the only source of truth (AC-E2, Task #03 requirement 3).

## 5. Mock outputs vs. real LLM outputs

The two must never be confused, in code or in the UI:

- **Mock (current, default).** All explanations produced today are generated by
  `mockLlmAdapter` — deterministic template code that implements the final system
  instruction's rules directly. No model is involved, no API key exists, output is always
  identical for identical input. The UI labels these "(AI — mock)" and the result carries
  `source: "mock-llm"`. The sample outputs in §2 are *also* simulated mock runs — illustrative
  examples written for this comparison, not live model calls.
- **Real LLM (future, not enabled).** If a real adapter is added later, it must send the
  final system instruction of §4, receive `{"explanation": string}`, pass the same output
  validation (non-empty, ≤ 280 chars, verdict agreement), and label its output differently
  (e.g. "(AI-generated)") with `source` distinguishing it from `"mock-llm"`. Any failure —
  timeout, API error, missing key, malformed or contradictory output — still falls back to
  the safe generic fallback with `source: "fallback"`, exactly as specified in Task #02 §5.
- **Never shipped as-is:** raw LLM text without validation, or an explanation that could
  disagree with the confirmed status shown directly above it.
