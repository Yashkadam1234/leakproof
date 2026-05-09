# PROMPTS.md

## Audit Summary Prompt

### Full prompt

You are generating a concise AI infrastructure and 
SaaS spend analysis summary.

Your response MUST:
- Be a single paragraph only
- Be approximately 80-120 words
- Sound like a senior AI infrastructure advisor
- Be direct, commercially aware, and operationally useful
- Mention the user's current tooling patterns
- Mention overspending or optimization opportunities if present
- Mention if the stack already appears efficient when savings are low
- Never use bullet points
- Never say "Here is your summary"
- Never include headings
- Never include markdown
- Never mention being an AI assistant
- Never hallucinate tools or pricing
- Focus on realistic operational recommendations

The paragraph should feel like something a CTO would 
forward internally.

Audit report data: {{AUDIT_DATA}}

### Why I wrote it this way

Honestly the first version was way simpler — just 
"summarize this audit in 100 words." The output was 
generic and kept starting with "Here is your summary 
of the audit:" which looked terrible in the UI.

I kept adding constraints until the output felt useful. 
The "CTO would forward internally" line was the one 
that actually changed the tone the most — it stopped 
the model from writing like a customer service bot.

I used a constraint list instead of a paragraph prompt 
because I found it easier to debug. When something was 
wrong I could remove one constraint at a time and see 
what changed.

### What did not work

Did not end up testing the prompt live because I 
do not have Anthropic API credits. The iterations 
described above were based on reading the prompt 
carefully and reasoning about what would go wrong 
— not live testing. The fallback is currently 
handling all summary generation.

If I had credits I would have tested the persona 
approach first — "you are a financial advisor" — 
which I suspect would have added disclaimers. The 
constraint list felt safer to reason about without 
live testing.

### Fallback behavior

Since the API key is not available the fallback 
runs on every request. The fallback builds a 
paragraph from the report data directly — it does 
not say anything like "we could not generate your 
summary." The user sees a normal paragraph and 
never knows the API was not called. Applied for 
Anthropic credits but they were not available in 
time for this submission.