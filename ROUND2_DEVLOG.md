## 2026-05-20 12:50 — Start

Read assignment carefully. 36 hours is tight.
Planning before coding — 30 minutes.

Key decisions to make:
- Cron vs manual trigger endpoint
- How to store pricing snapshot
- Diff view layout

Going with manual /api/detect-changes 
endpoint first, Vercel Cron as bonus.
Supabase already set up from Round 1.

## 2026-05-20 13:34 — Decided on approach

Will add columns to existing audits table
rather than new table — simpler and audits
already have the slug I need for the re-run link.

Starting with DB schema first.

## 2026-05-20 14:08 — Pricing DB done

Added pricing_snapshot, user_email, is_stale
and stale_reason columns to audits table. Also
created pricing_history table and notification_log
table to track pricing versions and prevent
duplicate emails.

Took longer than expected because I wanted the
Round 2 schema to stay compatible with the
existing Round 1 audits and leads tables.

## 2026-05-20 20:33 — Pricing monitoring logic

Built pricing-monitor.ts to compare stored
pricing snapshots against current tool pricing.
Added logic to detect:
- price increases
- price decreases
- added plans
- removed plans

Also added logic to determine whether an
existing audit result would actually change
after pricing updates instead of notifying
users for every small pricing diff.


## 2026-05-20 22:28 — Notification workflow

Built /api/detect-changes endpoint and grouped
affected audits by user email so users receive
one consolidated notification instead of
multiple emails.

Added notification-email.ts for HTML emails
showing:
- old vs new pricing
- updated savings impact
- direct audit re-run links

Also added /api/cron endpoint + vercel.json
cron config for weekly automatic checks.

Biggest issue here was duplicate notification
handling. Initial notification_log constraint
design did not work well for users with
multiple affected audits, so had to rethink
how notification tracking should work.

## 2026-05-21 10:45 — Resume work

Started testing the pricing notification flow
end-to-end. Wanted to verify duplicate emails
are prevented correctly before building the
diff UI page for stale audits.

Also need to validate cron behavior locally
before deploying the Vercel schedule.
