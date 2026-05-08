# DEVLOG.md

## Day 1 — 2026-05-07

**Hours worked:** 3.5 

**What I did:** Initialized Leakproof with Next.js 14, TypeScript strict 
mode, Tailwind, shadcn/ui. Created types/index.ts with all core interfaces. 
Implemented audit-engine.ts with 4 rule checks — plan fit, cheaper same 
tool, alternative tool, and Credex opportunity trigger. Wrote 8 Vitest 
tests. Hit 2 failing tests on first run.

**What I learned:** Bug 1 — test expectation was wrong, not the engine. 
A Team plan with 2 seats IS overspending, not just suboptimal. Fixed the 
test. Bug 2 — checkAlternativeTool had no case for ChatGPT coding use case 
at all, so it returned null. Added the missing case suggesting Cursor Pro. 
All 8 tests now pass. Also learned that usage-based billing tools need a 
different evaluation path than seat-based tools.

**Blockers / what I'm stuck on:** None going into Day 2. Want to make sure 
the AuditForm localStorage persistence works correctly across browsers.

**Plan for tomorrow:** AuditForm component with all 8 tools, localStorage 
persistence, landing page hero, Supabase setup, CI workflow file.

## Day 2 — 2026-05-08

**Hours worked:** 4 

**What I did:** Built AuditForm component with 
all 8 tools, plan dropdowns, seat count, monthly 
spend input, and use case selector. Wired 
localStorage persistence using useEffect so form 
state survives page reloads. Built landing page 
with hero section and form integration. Set up 
Supabase client with environment variables. Added 
CI workflow file.

**What I learned:** shadcn/ui components need to 
be installed individually via CLI — npx shadcn@latest 
add button — before they can be imported. The 
import alone does not create the file. Also learned 
that ESLint's react-hooks/set-state-in-effect rule 
flags setState calls inside useEffect even when the 
pattern is legitimate. Fixed by adding a useRef 
guard and targeted eslint-disable comments, then 
removed the unnecessary ones with --fix.

**Blockers / what I'm stuck on:** The setState 
inside useEffect lint error took longer than 
expected to resolve. The ref guard pattern silenced 
the cascading render concern but ESLint still flagged 
individual lines — had to use inline disable comments 
which then became unused after the rule stopped 
triggering, requiring a second --fix pass to clean up.

**Plan for tomorrow:** AuditResults page, ToolCard 
component, Anthropic API integration with fallback 
template, and the audit creation API route that 
saves to Supabase and returns a slug.