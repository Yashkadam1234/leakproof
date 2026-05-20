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

## 2026-05-20 14:08
 — Pricing DB done

Added pricing_snapshot, user_email, is_stale
columns to audits table. Also created
notification_log table to prevent duplicate emails.

Took longer than expected — had to check
existing RLS policies to make sure new
columns are covered.