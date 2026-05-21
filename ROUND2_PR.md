# feat: add re-audit on pricing change 
with email notifications

## What this PR does

Adds a system that stores a pricing snapshot 
with every audit, detects when tool prices 
change, emails affected users with a summary 
of what changed and how it affects their 
previous recommendation, and shows a diff 
view when they click through to re-run.

The audit URL from Round 1 now has a /diff 
variant that shows old vs new recommendations 
side by side.

## Why

Round 1 audits go stale the moment a vendor 
changes pricing. Cursor raised prices in 2024. 
Claude added new tiers in 2025. A user who 
ran an audit six months ago and bookmarked 
the result is now looking at wrong numbers 
without knowing it.

The assumption I made: users who captured 
their email through the lead form actually 
want to be notified. They opted in by 
submitting their email — that intent carries 
forward to pricing change notifications.

## How it works
New audit created
→ getCurrentPricingSnapshot() captures current
TOOLS_CATALOG prices with a version timestamp
→ Saved to audits table alongside report_json
POST /api/detect-changes triggered manually
→ Fetches all audits with pricing_snapshot
→ For each: compares stored snapshot vs current
→ Runs audit engine twice (old prices, new prices)
→ If results differ: marks audit is_stale = true
→ Groups affected audits by user_email
→ Sends one consolidated email per user via Resend
→ Logs to notification_log to prevent duplicates
User clicks re-run link from email
→ /audit/[slug]/diff
→ Fetches stored audit (old report + old snapshot)
→ Re-runs generateAuditReport with current pricing
→ Renders AuditDiff component side by side
→ Highlights changed rows, mutes unchanged ones
→ Shows total savings delta as hero number

New files:
- lib/pricing-snapshot.ts — snapshot extraction
- lib/pricing-monitor.ts — change detection logic
- lib/notification-email.ts — email builder
- app/api/detect-changes/route.ts — trigger endpoint
- app/api/cron/route.ts — Vercel Cron wrapper
- app/audit/[slug]/diff/page.tsx — diff view
- components/AuditDiff.tsx — diff table component

## What I cut

- **One-click unsubscribe in email** — the 
  bonus feature. Would need a new DB column 
  and an unsubscribe API route. Worth building 
  but the diff view felt more valuable to 
  get right first in the time available.

- **"What changed this week" public page** — 
  also bonus. Skipped entirely. The detection 
  logic exists and could power this page but 
  building the UI was not the right use of 
  the remaining hours.

- **Admin dashboard** — skipped. The 
  /api/detect-changes response already returns 
  auditsChecked, auditsAffected, emailsSent 
  as a JSON summary. A UI on top of that is 
  straightforward but not in the 36 hours.

- **Scheduled cron as primary trigger** — 
  Vercel Cron requires Pro plan which I do not 
  have. Built /api/detect-changes as the 
  primary manual trigger and /api/cron as a 
  thin wrapper for when cron is available. 
  Documented in How to test it manually.

- **Automated tests for the diff view** — 
  ran out of time. The pricing monitor logic 
  has unit tests. The diff page does not. 
  Listed in What is tested.

## How to test it manually

**Step 1 — Run a fresh audit**

Go to https://leakproof-gules.vercel.app
Add a tool: Cursor Pro, $40/month, 2 seats
Enter your email in the lead capture form
Submit and note the audit slug from the URL
e.g. /audit/abc123

**Step 2 — Verify pricing snapshot was stored**

In Supabase dashboard → audits table
Find the row with your slug
Confirm pricing_snapshot column is populated
Confirm user_email matches what you entered

**Step 3 — Simulate a pricing change**

In lib/audit-engine.ts temporarily change 
Cursor Pro price from 40 to 60:
{ id: "cursor-pro", pricePerSeat: 60 }

Or call the detect-changes endpoint with 
the current catalog — the snapshot stored 
in step 1 will differ from the current one.

**Step 4 — Trigger detection**

POST https://leakproof-gules.vercel.app/api/detect-changes

Expected response:
{
  "auditsChecked": 1,
  "auditsAffected": 1,
  "emailsSent": 1,
  "errors": []
}

**Step 5 — Check inbox**

Email arrives from onboarding@resend.dev
Subject: "Your Leakproof audit needs a refresh"
Contains: which tool changed, old vs new price,
link to https://leakproof-gules.vercel.app/audit/abc123/diff

**Step 6 — View the diff**

Click the link or navigate to /audit/[slug]/diff
See old recommendation vs new recommendation
Changed rows highlighted in yellow
Unchanged rows collapsed
Hero shows savings delta

## What is tested

- lib/pricing-monitor.ts — detectPricingChanges()
  returns correct PricingChange[] when prices differ
  
- lib/pricing-monitor.ts — wouldAuditChange()
  returns true when audit engine produces 
  different result with new pricing

- lib/pricing-monitor.ts — returns false when 
  pricing is identical

- notification_log deduplication — sending 
  detect-changes twice does not send 
  duplicate emails

Skipped due to time:
- AuditDiff component rendering tests
- /api/detect-changes integration test
- Email HTML content tests

## Open questions / risks

- **Email deliverability** — Resend free tier 
  sends from onboarding@resend.dev which lands 
  in spam. Users may miss the notification. 
  Production would need a verified custom domain.

- **Snapshot drift** — if a user runs an audit, 
  then we update the audit engine logic (not 
  just prices), the comparison might flag audits 
  as stale when the recommendation would 
  actually be the same. The current detection 
  compares engine output not just prices. 
  Need to decide whether logic changes should 
  also trigger notifications.

- **Scale** — getAffectedAudits() fetches all 
  audits and compares in memory. Fine at current 
  scale, breaks at 10k+ audits. Would need 
  pagination and background job processing 
  before any real traffic.