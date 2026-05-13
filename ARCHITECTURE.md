# ARCHITECTURE.md

## How the System Actually Works

The app is a workflow with five steps:

```mermaid
flowchart TD
    A[User visits landing page] --> B[AuditForm — tool inputs]
    B --> C[POST /api/audit]
    C --> D[audit-engine.ts — pure logic]
    D --> E[Anthropic API — AI summary]
    E --> F[(Supabase — audits table)]
    F --> G[Redirect to /audit/slug]
    G --> H[Public results page]
    H --> I[LeadCapture — POST /api/leads]
    H --> J[ShareButton — copies URL]
    I --> K[(Supabase — leads table)]
    I --> L[Resend — transactional email]
    G --> M[/api/og — dynamic OG image]
```

---

## Data Flow

User fills out the form. The frontend 
collects tool selections into typed 
AuditInput objects — tool ID, plan, 
monthly spend, seat count, use case.

On submit that array goes to POST /api/audit.

The API route validates the payload 
server-side then passes it to 
generateAuditReport() in lib/audit-engine.ts.

The audit engine is pure — no database 
calls, no API calls, no side effects. 
Just AuditInput[] in and AuditReport out. 
I made this decision early and it was 
probably the best one in the whole project. 
Testing became trivial. Bugs became obvious. 
The logic is readable without understanding 
anything about the rest of the stack.

After the report generates:
- Anthropic API creates a short summary 
  (falls back to a template if the API fails)
- Report saves to Supabase with a nanoid slug
- User redirects to /audit/[slug]

The public URL is shareable immediately. 
OG image generates dynamically at /api/og. 
Lead capture appears after the results — 
value shown before email is asked for. 
That sequencing was a deliberate product 
decision not a technical one.

---

## Stack Decisions

**Next.js 14 App Router**

This project mixes landing pages, API 
routes, server rendering, dynamic metadata, 
and shareable URLs. Next.js handles all 
of that without needing separate services. 
App Router made the OG image route and 
dynamic slug pages straightforward.

I considered just using Express with a 
separate React frontend but that felt 
like unnecessary infrastructure for a 
one-week build. Next.js let me stay 
focused on product logic.

**Supabase**

Needed Postgres, simple CRUD, fast setup, 
hosted. Supabase was the obvious choice. 
The only friction was that column names 
must be snake_case — I had camelCase in 
the TypeScript insert objects and spent 
longer than I should have debugging silent 
failures before catching it.

Only two tables: audits and leads. 
Nothing complicated.

**Resend**

Needed transactional email that just worked. 
Resend has a clean API and the free tier 
was enough for development and testing. 
One limitation worth noting: free tier 
only sends to your own verified email 
until you add a custom domain. Fine for 
this submission, would need to fix before 
a real launch.

**Tailwind + shadcn/ui**

Speed mattered more than a custom design 
system. Tailwind kept me in the component 
files. shadcn/ui gave accessible primitives 
I could customize without fighting the 
defaults. The one annoyance: shadcn 
components do not exist just because you 
import them — you have to run the CLI 
command for each one individually. Took 
me longer than it should have to figure 
that out on day two.

**Anthropic API with fallback**

Used for the personalized audit summary. 
Did not have API credits so the fallback 
template runs on every request currently. 
The fallback is dynamic — it uses real 
numbers from the report — so the output 
still feels personalized even without 
the API. Would wire up real API access 
before a production launch.

---

## What I Would Change at 10k Audits/Day

**Rate limiting** — currently uses an 
in-memory Map which breaks across multiple 
server instances. Would move to Upstash 
Redis for distributed rate limiting.

**OG image caching** — dynamic OG generation 
at /api/og runs on every request. At scale 
these should be cached at the CDN layer 
since the audit data never changes after 
creation.

**Public audit pages** — /audit/[slug] pages 
are effectively static after the audit is 
saved. Would add CDN caching to avoid 
unnecessary Supabase reads on every visit.

**Connection pooling** — Supabase has 
connection limits. Under real traffic 
would add PgBouncer or enable Supabase's 
built-in pooling before hitting those limits.

The architecture is intentionally simple 
for a one-week build. None of these scaling 
changes are hard — they just were not 
worth the time at this stage. 