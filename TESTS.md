```markdown
# TESTS.md

## Overview

All tests cover the audit engine — the pure 
function layer that runs the spend analysis. 
This is intentionally the most tested part 
of the codebase because it is where wrong 
logic directly translates to wrong financial 
recommendations shown to real users.

The audit engine has no API calls, no database 
access, and no side effects — which makes it 
straightforward to test with deterministic inputs.

---

## Test Files

### tests/audit-engine.test.ts

**How to run:**
```bash
npm run test
```

**Or in watch mode during development:**
```bash
npm run test:watch
```

**What it covers:**

---

**Test 1 — flags Team plan for 2 seats as overspending**

```
Input: Claude Team Standard, 2 seats, writing use case
Expected: status === "overspending"
```

Validates that the engine correctly identifies 
Team plans as financially unjustified for very 
small teams. The admin controls and centralized 
billing features of Team plans deliver most of 
their value at 5 or more seats.

---

**Test 2 — does not flag Team plan for 6 seats**

```
Input: Claude Team Standard, 6 seats, coding use case
Expected: status === "optimal"
```

Validates the inverse — that the engine does 
not over-flag legitimate Team plan usage. A 
6-seat team genuinely benefits from centralized 
billing and usage visibility.

---

**Test 3 — suggests cheaper alternative for 
ChatGPT Plus on coding use case**

```
Input: ChatGPT Plus, 3 seats, coding use case
Expected: result is not null, recommendedAction 
matches /cursor|claude|windsurf/i
```

Validates cross-vendor alternative suggestions. 
ChatGPT Plus for a coding-focused team has 
better-fit alternatives at similar or lower 
price points. The engine should surface at 
least one.

---

**Test 4 — calculates monthly savings correctly**

```
Input: Claude Max, 3 seats, writing use case, 
       $300/month spend
Expected: totalMonthlySavings === 240
```

Validates arithmetic. Claude Max at $100/seat 
downgraded to Pro at $20/seat across 3 seats 
saves $240/month. This is the most basic 
sanity check on the savings calculation path.

---

**Test 5 — triggers Credex CTA when total 
spend exceeds $500**

```
Input: Two tools with combined spend over $500
Expected: report.showCredexCta === true
```

Validates the business rule that surfaces 
the Credex consultation CTA. Teams spending 
above $500/month on AI tools are the core 
Credex target customer — the CTA should 
appear for them.

---

**Test 6 — does NOT trigger Credex CTA 
when total spend is under $500**

```
Input: Two tools with combined spend of $300
Expected: report.showCredexCta === false
```

Validates the inverse. Smaller spenders should 
not see the Credex CTA — showing it to everyone 
regardless of spend would undermine trust in 
the recommendations.

---

**Test 7 — marks correctly sized individual 
plan as optimal**

```
Input: GitHub Copilot Pro, 1 seat, coding use case
Expected: status === "optimal"
```

Validates that the engine does not over-flag 
correctly matched plans. A single developer 
on an individual plan is exactly the right 
fit — no recommendation needed.

---

**Test 8 — annual savings is exactly 12x monthly**

```
Input: Any inputs with non-zero savings
Expected: totalAnnualSavings === totalMonthlySavings * 12
```

Simple but important. The annual savings 
number appears prominently in the results 
hero. If the multiplier is wrong it is 
immediately visible and undermines trust 
in all the other numbers.

---

## What Is Not Tested and Why

**Anthropic API integration** — the generateAuditSummary 
function is not unit tested because it either 
calls a live API or returns a fallback template. 
Both paths are covered by the graceful failure 
handling in the function itself. Testing this 
would require mocking the Anthropic client 
which adds complexity without adding much 
confidence given the fallback already handles 
all failure cases.

**Supabase writes** — not unit tested because 
they require a live database connection. 
End-to-end testing covers this path through 
manual verification of the audits and leads 
tables after form submission.

**UI components** — not tested with component 
tests. The audit engine is the only place 
where a bug has direct financial consequences 
for users. Component bugs are visible 
immediately and caught through manual testing 
during development.

---

## Running the Full Test Suite

```bash
npm run test
```

Expected output:
```
✓ audit-engine (8)
  ✓ flags Team plan for 2 seats as overspending
  ✓ does not flag Team plan for 6 seats
  ✓ suggests cheaper alternative for ChatGPT Plus
  ✓ calculates monthly savings correctly
  ✓ triggers Credex CTA above $500 spend
  ✓ does not trigger Credex CTA below $500
  ✓ marks individual plan as optimal
  ✓ annual savings is 12x monthly

Test Files  1 passed
Tests       8 passed
```

---

## CI Integration

Tests run automatically on every push to main 
via GitHub Actions. The workflow file is at 
`.github/workflows/ci.yml` and runs lint, 
type-check, and tests in sequence.

A red CI check on main means either a test 
failed or a type error was introduced. 
Both block deployment until fixed.
```