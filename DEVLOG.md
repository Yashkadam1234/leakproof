 # DEVLOG.md

## Day 1 — 2026-05-07

**Hours worked:** 3.5

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