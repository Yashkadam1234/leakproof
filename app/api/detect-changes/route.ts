import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  getAffectedAudits,
  type AffectedAudit,
} from "@/lib/pricing-monitor";
import { buildNotificationEmail } from "@/lib/notification-email";
import { supabase } from "@/lib/supabase";

interface DetectChangesSummary {
  auditsChecked: number;
  auditsAffected: number;
  emailsSent: number;
  errors: string[];
}

function createPricingVersion(audits: AffectedAudit[]): string {
  const signature = audits
    .flatMap((audit) =>
      audit.changes.map(
        (change) =>
          `${change.toolId}:${change.planId}:${change.oldPrice}:${change.newPrice}:${change.changeType}`
      )
    )
    .sort()
    .join("|");

  let hash = 0;

  for (let index = 0; index < signature.length; index += 1) {
    hash = (hash * 31 + signature.charCodeAt(index)) >>> 0;
  }

  return `pricing-${hash}`;
}

async function getAuditsCheckedCount(): Promise<number> {
  const { count, error } = await supabase
    .from("audits")
    .select("id", {
      count: "exact",
      head: true,
    })
    .not("pricing_snapshot", "is", null)
    .eq("is_stale", false);

  if (error) {
    throw new Error("Failed to count checked audits");
  }

  return count ?? 0;
}

async function processPricingChanges(): Promise<DetectChangesSummary> {
  const errors: string[] = [];
  let emailsSent = 0;

  const auditsChecked = await getAuditsCheckedCount();
  const affectedAudits = await getAffectedAudits();
  const pricingVersion = createPricingVersion(affectedAudits);

  const auditsByUser = new Map<string, AffectedAudit[]>();

  for (const audit of affectedAudits) {
    if (!audit.userEmail) {
      errors.push(`Audit ${audit.slug} has no user email`);
      continue;
    }

    const existing = auditsByUser.get(audit.userEmail) ?? [];
    existing.push(audit);
    auditsByUser.set(audit.userEmail, existing);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const [userEmail, userAudits] of auditsByUser.entries()) {
    const { data: existingNotification, error: notificationCheckError } =
      await supabase
        .from("notification_log")
        .select("id")
        .eq("user_email", userEmail)
        .eq("pricing_version", pricingVersion)
        .maybeSingle();

    if (notificationCheckError) {
      errors.push(
        `Failed to check notification log for ${userEmail}: ${notificationCheckError.message}`
      );
      continue;
    }

    if (existingNotification) {
      continue;
    }

    const email = buildNotificationEmail(userEmail, userAudits);

    try {
      await resend.emails.send({
        from: "Leakproof <audit@yourdomain.com>",
        to: userEmail,
        subject: email.subject,
        html: email.html,
      });

      emailsSent += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown email error";

      errors.push(`Failed to send email to ${userEmail}: ${message}`);
      continue;
    }

    const auditSlugs = userAudits.map((audit) => audit.slug);

    const { error: staleUpdateError } = await supabase
      .from("audits")
      .update({
        is_stale: true,
        stale_reason: {
          pricingVersion,
          changes: userAudits.map((audit) => ({
            slug: audit.slug,
            changes: audit.changes,
          })),
        },
      })
      .in("slug", auditSlugs);

    if (staleUpdateError) {
      errors.push(
        `Failed to mark audits stale for ${userEmail}: ${staleUpdateError.message}`
      );
    }

    const { error: notificationInsertError } = await supabase
      .from("notification_log")
      .insert({
        user_email: userEmail,
        audit_slug: auditSlugs[0],
        pricing_version: pricingVersion,
        sent_at: new Date().toISOString(),
      });

    if (notificationInsertError) {
      errors.push(
        `Failed to insert notification log for ${userEmail}: ${notificationInsertError.message}`
      );
    }
  }

  return {
    auditsChecked,
    auditsAffected: affectedAudits.length,
    emailsSent,
    errors,
  };
}

export async function POST() {
  try {
    const summary = await processPricingChanges();

    return NextResponse.json(summary, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected detect-changes error";

    return NextResponse.json(
      {
        auditsChecked: 0,
        auditsAffected: 0,
        emailsSent: 0,
        errors: [message],
      },
      {
        status: 500,
      }
    );
  }
}