# USER_INTERVIEWS.md

## Interview 1 — Venkatesh, SWE, 
Large Tech Company

**Date:** 2026-05-10
**Duration:** ~8 minutes (WhatsApp text)
**How I found them:** Cold DM on X — 
had posted about AI tooling recently

**Context:** Software engineer at a large 
tech company. Uses AI tools daily for 
coding work. The conversation was brief — 
he responded but did not have much time. 
Got enough to be useful though.

**Direct quotes:**
- "We mostly use what the company provides"
- "I personally use Claude a lot but 
  that's on my own account"
- "Honestly I don't know what the company 
  pays for any of this"

**Most surprising thing he said:**

He pays for Claude personally out of 
pocket because the company-provided 
tools are not good enough for his 
actual workflow. So his employer is 
paying for one set of AI tools and 
he is separately paying for better 
ones himself. The company spend and 
the actual spend are completely 
different numbers — and nobody tracks 
the gap.

**What it changed about my design:**

I had assumed the person filling in 
the audit form would know their 
company's AI spend. Venkatesh made 
me realize many individual contributors 
genuinely have no idea — procurement 
is invisible to them. The form now 
has clearer guidance that it is designed 
for team leads and managers who have 
visibility into billing, not only individual 
contributors who just use the tools.

---

## Interview 2 — Ratnadeep, SWE, 
Large Enterprise

**Date:** 2026-05-12
**Duration:** ~50 minutes (WhatsApp text)
**How I found them:** College contact, 
works as a software engineer at a 
large organization

**Context:** Works at an organization 
where AI tools are bundled into 
enterprise procurement. Does not have 
visibility into individual tool costs. 
Uses GitHub Copilot most frequently 
alongside several inbuilt AI tools 
embedded in internal systems.

**Direct quotes:**
- "Spend we don't have as its enterprise 
  purchase"
- "No one questions on usage. They keeps 
  on exploring helpful things and collect 
  cons at first instead of pros"
- "I share or follow only those advantages 
  which reduces my donkey work and save 
  my time effectively"
- "Create a Google Form and add situational 
  questions with different situations... 
  send it across peoples working in 
  industry and gather info. This would 
  add more value to your dashboard"

**Most surprising thing he said:**

I expected him to say the tool sounded 
useful for tracking spend. Instead he 
described a specific internal AI adoption 
pattern I had never considered — at 
large enterprises, new tools get evaluated 
by collecting negatives first, then 
broadcasting the positives so adoption 
spreads organically. Nobody questions 
whether the enterprise spend is worth 
it because nobody knows what individual 
tools cost. The spend is invisible by 
design at the engineer level.

That reframed who the actual user of 
this tool is. At enterprise scale it 
is not the engineer — it is procurement 
or engineering leadership several levels 
up. The engineer using Copilot daily 
has no idea what it costs.

**What it changed about my design:**

Two things. First — I added clearer 
messaging that the tool is designed 
for team leads and engineering managers 
with billing visibility, not individual 
contributors.

Second — his Google Form suggestion 
made me think seriously about benchmark 
mode. "Your team spends $X — similar 
teams average $Y" is a feature I had 
not planned but now want to build in 
week 2. The spec lists it as a bonus 
feature. This conversation is what made 
me take it seriously.

---

## Interview 3 — Priya, QA Engineer, 
Infosys (mid-size project team)

**Date:** 2026-05-13
**Duration:** ~20 minutes (WhatsApp call)
**How I found them:** College contact, 
currently working at Infosys on a 
client-facing project team

**Context:** Works in QA on a project 
team of around 25 people. The team 
uses a mix of company-provided tools 
and individually expensed subscriptions 
depending on the project phase. Has 
some visibility into team tooling 
decisions because she is involved in 
test automation discussions.

**Direct quotes:**
- "We use Copilot but honestly half 
  the team doesn't really use it — 
  they just have the license"
- "I use ChatGPT on my personal account 
  because it's faster to just pay 
  myself than wait for IT approval"
- "Nobody ever checks if people are 
  actually using what they're paying for"
- "If something showed me we're paying 
  for tools nobody uses I would 
  definitely forward that to my manager"

**Most surprising thing she said:**

She mentioned that getting a new AI 
tool approved through IT takes so long 
that most engineers just pay out of 
pocket and expense it — or just use 
free tiers and work around the 
limitations. The company is paying 
for licensed tools that sit unused 
while employees pay separately for 
the tools they actually want.

I had not thought about IT approval 
latency as a driver of shadow AI spend. 
It means the real waste is not just 
wrong plan sizes — it is licensed 
seats that are technically paid for 
but not actually used because the 
approval process pushed people to 
find alternatives.

**What it changed about my design:**

I added "seats" as a prominent field 
in the audit form with helper text 
explaining it should reflect active 
users not just licensed seats. The 
distinction matters — 10 licensed 
seats with 4 active users is a very 
different audit result than 10 seats 
with 10 active users.

It also reinforced that the tool 
needs to ask about actual usage not 
just billing. A future version should 
ask "how many people on your team 
actually use this tool weekly" 
separately from seat count.