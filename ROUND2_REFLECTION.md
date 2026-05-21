# ROUND2_REFLECTION.md

## 1. Most uncomfortable trade-off

The hardest cut was not building automated 
tests for the diff view and the 
detect-changes endpoint.

I had the pricing monitor unit tests done 
and they gave me confidence the core logic 
was right. But the diff page itself — the 
thing the reviewer will actually click — 
has no test coverage. If the AuditDiff 
component renders incorrectly or the slug 
lookup fails in an edge case I would not 
catch it until someone hits it manually.

I made the call to spend that time on 
the email consolidation logic instead — 
the one-email-per-user deduplication felt 
like the kind of thing that would cause 
real damage if wrong. A broken test is 
embarrassing. Spamming a user with five 
emails because they had five audits is 
worse.

That trade-off still bothers me a little.

## 2. First thing with 24 more hours

Write integration tests for the full 
detect-changes flow.

Not the diff view UI — that is relatively 
easy to verify manually. The thing I would 
test first is the exact sequence: create 
audit, modify pricing, trigger detection, 
verify email sent, verify notification_log 
has entry, trigger detection again, verify 
no second email.

Right now I have done that manually three 
times and it works. But manual testing 
is not a substitute for a repeatable test 
that runs in CI. If someone touches 
pricing-monitor.ts three months from now 
they have no safety net.

That would be the first 4 hours of the 
extra day. The remaining 20 would go to 
the unsubscribe link — that is the feature 
I cut that I most wish was there.

## 3. What Round 1 made harder for Round 2

The audit engine reads directly from a 
module-level TOOLS_CATALOG constant. Clean 
for Round 1 — no configuration needed, 
just import and call.

For Round 2 I needed to run the engine 
twice with different pricing data to 
compare results. That meant I could not 
just call generateAuditReport() with 
different inputs — the pricing is baked 
into the function itself.

I ended up creating generateAuditReportWithPricing() 
that accepts a catalog override parameter. 
It works but it duplicates some logic and 
the function signatures are now inconsistent 
in a way that would confuse someone reading 
the code for the first time.

If I had known Round 2 was coming I would 
have made pricing injectable from the start — 
pass the catalog as a parameter, default 
to TOOLS_CATALOG if not provided. One 
function, one signature, easy to test 
with any pricing data.

That is probably the clearest example of 
a Round 1 decision that felt right at the 
time and cost real time in Round 2.