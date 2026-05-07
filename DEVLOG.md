# DEVLOG.md

## Day 1 — 2025-01-XX

**Hours worked:** X

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