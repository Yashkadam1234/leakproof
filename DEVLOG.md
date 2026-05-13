 # DEVLOG.md

## Day 1 — 2026-05-07

**Hours worked:** 3

**What I did:** Set up the project — Next.js 14, 
TypeScript strict, Tailwind, shadcn/ui. Built 
types/index.ts and the full audit engine with 4 
rule checks. Wrote 8 Vitest tests. Two failed on 
first run which took a while to debug.

**What I learned:** First failing test — I assumed 
the engine was wrong but actually the test 
expectation was wrong. A Team plan with 2 seats 
really is overspending not just suboptimal. Second 
failing test — checkAlternativeTool had no case 
for ChatGPT at all, it just returned null silently. 
Took me a bit to realise the function was not even 
reaching the check.

**Blockers / what I'm stuck on:** Tests pass now 
but I am not fully confident the audit logic covers 
enough edge cases. Usage-based tools like the 
Anthropic API feel under-handled — I basically just 
let the user enter their spend and skip the plan-fit 
check. Not sure if that is good enough.

**Plan for tomorrow:** AuditForm with all 8 tools, 
localStorage persistence, landing page, Supabase 
setup, CI workflow.

---

## Day 2 — 2026-05-08

**Hours worked:** 4

**What I did:** Built AuditForm with all 8 tools, 
plan dropdowns, seat count, spend input, use case 
selector. Wired localStorage so form survives 
refresh. Built the landing page hero. Set up 
Supabase client. Got CI workflow running.

**What I learned:** shadcn/ui components do not 
exist just because you import them — you have to 
run the CLI command for each one individually. 
Spent probably 20 minutes confused about why the 
import was failing before I figured that out. Also 
the ESLint setState-in-effect rule is stricter than 
I expected — even with a ref guard it still flagged 
individual lines. Had to add inline disable comments 
then run --fix to clean up the ones that became 
redundant. Annoying but fine.

**Blockers / what I'm stuck on:** CI went green 
which is good. But I have not actually tested the 
form end to end yet — there is no API route to POST 
to so the submit just errors. Will fix tomorrow 
when I build the audit route.

**Plan for tomorrow:** AuditResults page, ToolCard, 
Anthropic API integration, audit creation API route.

---

## Day 3 — 2026-05-09

**Hours worked:** 6

**What I did:** Built AuditResults and ToolCard 
with color coded borders. Built the audit API 
route — it runs the engine, calls Anthropic, saves 
to Supabase, returns a slug. Integrated Anthropic 
with a fallback for when the API fails. Built the 
public /audit/[slug] page. Wrote PROMPTS.md.

**What I learned:** The prompt took way more 
iteration than I expected. First version just said 
summarize this in 100 words and the output was 
terrible — generic and always started with "Here 
is your summary:" which looked awful in the UI. 
Had to add a lot of explicit constraints. The line 
about "something a CTO would forward internally" 
was the one that actually changed the tone. Also 
hit a Next.js 15 breaking change — params is now 
a Promise and needs to be awaited before accessing 
slug. Took me a moment to figure out why the page 
was throwing on every request.

**Blockers / what I'm stuck on:** Noticed a logic 
bug — GitHub Copilot Team plan showed status as 
"Optimized" in the card but the recommended action 
said "Downgrade to individual plan." Those two 
contradict each other. The engine is returning the 
right recommendation but the status field is wrong. 
Need to fix this tomorrow.

**Plan for tomorrow:** Lead capture API, Resend 
email integration, OG image generation, fix the 
status contradiction bug in the audit engine.
---

---

## Day 4 — 2026-05-10

**Hours worked:** 5

**What I did:** Built the leads API route 
with Supabase storage and Resend transactional 
email. Added honeypot spam protection and 
in-memory rate limiting. Fixed multiple Supabase 
column name mismatches — every camelCase field 
was failing because Supabase expects snake_case. 
Added Navbar component. Fixed the seats field 
hiding for usage-based API tools. Updated GitHub 
Copilot plans to match current official pricing 
— the catalog was outdated, missing Pro and Pro+ 
tiers entirely. Fixed the ChatGPT alternative 
tool suggestion which was returning null because 
estimated savings was zero and getting overridden 
by the optimal result. Fixed ToolCard to show 
"Review plan" chip for suboptimal status instead 
of "Optimized" which was contradicting the 
recommended action text.

**What I learned:** Supabase column names must 
be snake_case — camelCase silently fails with 
a schema cache error that took a while to 
connect to the actual cause. Also learned that 
Resend free tier only sends to your own verified 
email — found the confirmation in spam. The 
native share API on Windows opens the OS share 
dialog which is actually better UX than just 
copying to clipboard.

**Blockers / what I'm stuck on:** The reduce 
logic in generateAuditReport picks the highest 
savings recommendation — which means any 
alternative suggestion with estimatedSavings 
of 0 gets silently ignored in favour of the 
optimal result. Fixed by giving the ChatGPT 
coding alternative a small non-zero savings 
value. Not the cleanest solution but it works 
and the number is defensible.

**Plan for tomorrow:** Deploy to Vercel, run 
Lighthouse on mobile, fix any accessibility 
issues, conduct user interviews, write 
USER_INTERVIEWS.md.

---

## Day 5 — 2026-05-11

**Hours worked:** 4

**What I did:** Deployed to Vercel and tested 
the full end-to-end flow on the live URL. Ran 
Lighthouse on mobile. Fixed the hero section 
layout — there were two nested container divs 
with conflicting max-widths causing the content 
to shift left. Fixed a missing anchor tag that 
broke the entire page JSX. Got OG image working 
on Twitter — tested on opengraph.xyz and the 
rich preview card shows correctly with the 
Leakproof branding and savings number.

**What I learned:** Lighthouse scores fluctuate 
a lot between runs — got anywhere from 73 to 86 
on the same page without changing anything. The 
dynamic import for AuditForm actually made Total 
Blocking Time worse (840ms to 1230ms) so I 
reverted it. The main bottleneck is shadcn/ui 
bundle size on slow 4G mobile simulation — hard 
to fix without switching UI libraries. WhatsApp 
does not show OG image previews — only Twitter, 
LinkedIn and Telegram do.

**Blockers / what I'm stuck on:** Performance 
score is sitting at 75-86 range depending on 
the run — sometimes below the 85 target. The bottleneck 
is Total Blocking Time from the JavaScript 
bundle.not do yet with the user interview 
today — will follow up tomorrow and write 
USER_INTERVIEWS.md on Day 6.

**Plan for tomorrow:** Write GTM.md, ECONOMICS.md, 
METRICS.md, LANDING_COPY.md, ARCHITECTURE.md, 
TESTS.md, USER_INTERVIEWS.md once interviews 
are done.


---

## Day 6 — 2026-05-12

**Hours worked:** 4

**What I did:** Wrote all entrepreneurial
files — GTM.md, ECONOMICS.md, METRICS.md,
LANDING_COPY.md. Also wrote ARCHITECTURE.md,
TESTS.md, and USER_INTERVIEWS.md. Conducted
user interviews — got two real conversations,
one with a contact at a large tech company
and one with Ratnadeep at Infosys. Attempted
40+ cold DMs on X and Instagram for a third
interview but did not get a response that
led to a substantive conversation. Documented
this honestly in USER_INTERVIEWS.md rather
than fabricating a third interview.

**What I learned:** The entrepreneurial
files took significantly longer than I
expected — not because the writing was
hard but because making them sound like
genuine founder thinking rather than
template fills required multiple rewrites.
The ECONOMICS.md especially — the first
version was too clean and structured. Had
to add honest uncertainty and specific
insights like the viral coefficient angle
and the qualified buyer profile insight
to make it read as real analysis.

**Blockers / what I'm stuck on:** Only
got 2 user interviews instead of 3. Sent
40+ DMs but most went unanswered. Decided
to document this honestly rather than
fabricate — the assignment is explicit
that faking interviews is an instant
reject. Starting outreach on day 1
instead of day 4 would have given more
buffer time.

**Plan for tomorrow:** Write README.md
with real screenshots, finalize REFLECTION.md,
write Day 7 DEVLOG entry, run final
end-to-end test on live URL, verify CI
is green, submit Google Form.

---

## Day 7 — 2026-05-13

**Hours worked:** 3

**What I did:** Wrote README.md with
decisions section and quick start guide.
Finalized REFLECTION.md. Added robots.txt
to fix 404. Added revalidation cache to
audit pages to reduce Supabase cold start
latency. Added autocomplete attributes
to form inputs for accessibility. Ran
final end-to-end test on live Vercel URL
— form submits, audit generates, results
page loads, share button works, lead
capture saves to Supabase, email arrives
in inbox. Verified CI is green on latest
commit. Submitted Google Form.

**What I learned:** Lighthouse performance
score stayed in the 71-83 range despite
multiple optimization attempts. The
bottleneck is 342 KiB of unused JavaScript
from shadcn/ui and Radix UI — not fixable
without replacing the component library.
Best run was 83. Accessibility 96, Best
Practices 100, SEO 100. Three out of four
scores are strong.

**Blockers / what I'm stuck on:** Performance
score did not reach the 85 target. Tried
dynamic imports — made it worse. Tried
optimizePackageImports — marginal improvement.
The honest answer is shadcn/ui adds bundle
weight that is hard to eliminate in a
one-week build without a full component
library rewrite.

**Plan for tomorrow:** Submitted. Waiting
for Round 2 result within 3 working days.