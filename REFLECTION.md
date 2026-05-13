# REFLECTION.md

## Question 1 — The hardest bug

The worst one was the status contradiction 
in the audit engine. GitHub Copilot Team 
plan with 2 seats was showing a red border 
and "Downgrade to individual plan" as the 
recommended action — but the chip in the 
corner said "Optimized." Those two things 
directly contradicted each other on the 
same card.

My first assumption was that the ToolCard 
component was reading the wrong field. I 
spent time looking at the JSX, checking 
which prop was being passed, making sure 
the result object was correct. Everything 
looked right in the component.

Then I looked at generateAuditReport and 
found the actual problem. The reduce 
function was picking the best recommendation 
by highest estimatedSavings. The team plan 
downgrade was returning status "overspending" 
but estimatedSavings of 0 — because the 
savings calculation was doing 
(plan.pricePerSeat - 20) * seats which 
came out negative for GitHub Copilot Team 
at $19/seat, so it defaulted to 0. The 
reduce then picked the checkPlanFit result 
which had status "optimal" because it was 
also returning 0 savings. Two candidates, 
both with 0 savings, wrong one wins.

The fix was two parts. First, add a status 
priority map so "overspending" beats 
"optimal" when savings are equal. Second, 
fix the savings calculation to use 
percentage of actual spend rather than 
a hardcoded price difference — because 
the hardcoded approach breaks for tools 
where the team plan is only marginally 
more expensive than individual.

What I will do differently: when a 
recommendation has a status that implies 
action but savings of zero, that should 
be a red flag in the logic. The two 
fields should be consistent by design, 
not by coincidence.

---

## Question 2 — A decision I reversed

I added dynamic imports for AuditForm 
on day 5 trying to improve the Lighthouse 
performance score. The reasoning was 
straightforward — AuditForm is a heavy 
component with a lot of state, and lazy 
loading it would reduce initial bundle 
size and improve time to interactive.

Lighthouse went from 79 to 73.

I had assumed dynamic imports would always 
help performance because that is what most 
performance guides say. What I did not 
account for was that the AuditForm is 
visible immediately on page load — it is 
not below the fold, it is not in a modal, 
it is literally the main content of the 
page. Lazy loading something the user 
needs immediately just adds a loading 
delay on top of the initial render. Total 
Blocking Time went up from 840ms to 
1,230ms.

I reverted it the same session. The 
lesson was that dynamic imports help 
when you are deferring something the 
user does not immediately need. For 
the primary UI they make things worse.

Lighthouse performance score stayed in the 
71-83 range despite multiple optimization 
attempts. Best score achieved was 83 on 
one run. The main bottleneck is 342 KiB 
of unused JavaScript from shadcn/ui and 
Radix UI primitives. Fixing this properly 
would require replacing the component 
library entirely — a 2-3 day refactor 
that was not worth attempting in the 
final days of a one-week build.
Accessibility: 96 
Best Practices: 100 
SEO: 100 
Performance: 71-83 (best run: 83)

---

## Question 3 — Week 2 wishlist

**1. Benchmark mode**

"Your team spends $X per developer per 
month — teams your size average $Y."

This came directly from the Ratnadeep 
interview. He works at a large enterprise 
where AI tools are bundled into procurement 
and nobody questions individual tool costs 
because the spend is invisible at their 
level. A benchmark gives people a reference 
point even when they cannot see their own 
full spend. It also gives Credex a data 
angle for newsletter pitches — "we audited 
100 teams, average overspend is $340/month" 
is a story. Raw audit results are not.

**2. Fix the same-reason text bug**

Right now when multiple tools are on 
oversized team plans they all get the 
same reason text. A finance person reading 
the report would notice immediately. I 
noted it in the devlog and left it for 
week 2. The fix is straightforward — 
tool-specific reason strings — but I ran 
out of time to make them all good enough 
to ship.

**3. Real Anthropic API integration**

The fallback template works and produces 
reasonable output. But the real API would 
let the summary respond to nuance — a 
team using Claude Max for heavy research 
workflows is a different situation than 
a team using it for writing emails. The 
fallback treats them the same. Getting 
API credits and wiring this up properly 
is the first thing I would do in week 2.

**4. Email domain verification for Resend**

Currently the confirmation email sends 
from onboarding@resend.dev and lands in 
spam. With a verified custom domain it 
would land in inbox. Not a product feature 
but it affects trust significantly — an 
email from a real domain makes the tool 
feel like a real product.

---

## Question 4 — How I used AI

I used ChatGPT as the primary coding 
assistant throughout the week. Claude 
was used for thinking through product 
decisions and documentation.

**What I used AI for:**

Generating boilerplate — API routes, 
component structure, TypeScript interfaces. 
Debugging TypeScript errors when the 
error messages were cryptic. Drafting 
the entrepreneurial files as a starting 
point that I then rewrote significantly. 
Explaining Next.js 15 breaking changes 
I had not encountered before — the 
params-as-Promise change especially.

**What I did not trust AI with:**

The audit engine logic. Every rule in 
audit-engine.ts I wrote and verified 
manually against the actual vendor 
pricing pages. The pricing data in 
PRICING_DATA.md I verified by visiting 
each URL myself. The AI would have 
hallucinated prices confidently and I 
would not have caught it until a reviewer 
did. That would have been the worst 
possible place to have wrong numbers.

I also did not trust AI with the 
DEVLOG entries or REFLECTION. Those 
needed to reflect what actually happened, 
not a plausible version of what might 
have happened.

**One time the AI was wrong:**

ChatGPT suggested fixing the setState 
in useEffect lint error by adding 
eslint-disable-next-line comments. That 
worked but then lint flagged the disable 
comments as unused after the rule stopped 
triggering, which required a second 
--fix pass to clean up. The actual fix 
was a useRef guard pattern that prevented 
the cascade in the first place. The AI 
gave me the workaround before the solution. 
I caught it because the workaround left 
the codebase messier than it needed to be.

---

## Question 5 — Self-ratings

**Discipline: 7/10**

I started on time and committed every 
day, but day 6 documentation took longer 
than planned and pushed some things to 
day 7 that should have been done earlier.

**Code quality: 7/10**

The audit engine is clean, typed, and 
well-tested. Some of the UI components 
got messy toward the end — particularly 
the audit results page which has too 
many responsibilities in one file. I 
would refactor that in week 2.

**Design sense: 6/10**

The product looks credible enough that 
I would not be embarrassed to show it 
to a CTO. But I spent too long on layout 
issues that should have been resolved 
in day 2 and not enough time on the 
actual visual hierarchy of the results 
page, which is the page that matters most.

**Problem-solving: 7/10**

I worked through every bug eventually. 
The status contradiction bug took longer 
than it should have because I looked in 
the wrong place first. The dynamic import 
regression I caught and reverted quickly. 
Generally I debugged methodically but 
not always efficiently.

**Entrepreneurial thinking: 8/10**

This is the part I invested most heavily 
in beyond what felt comfortable for an 
engineering assignment. The economics 
analysis, the specific GTM channels, 
the insight about finance communities 
as an underexplored audience — those 
came from genuinely thinking about 
whether this product would work, not 
just whether it would pass review.