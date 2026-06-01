import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { supabase } from "@/lib/supabase";
import type { AuditReport } from "@/types";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

/**
 * Simple in-memory rate limiting.
 *
 * Key = IP address
 * Value = timestamps of requests
 */
const rateLimitStore = new Map<
  string,
  number[]
>();

const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadPayload {
  email?: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditSlug?: string;
  website?: string;
}

function isRateLimited(
  ip: string
): boolean {
  const now = Date.now();

  const existing =
    rateLimitStore.get(ip) ?? [];

  /**
   * Remove expired timestamps.
   */
  const validTimestamps =
    existing.filter(
      (timestamp) =>
        now - timestamp < WINDOW_MS
    );

  if (
    validTimestamps.length >=
    MAX_REQUESTS
  ) {
    rateLimitStore.set(
      ip,
      validTimestamps
    );

    return true;
  }

  validTimestamps.push(now);

  rateLimitStore.set(
    ip,
    validTimestamps
  );

  return false;
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as LeadPayload;

    /**
     * Honeypot spam protection.
     *
     * Bots often fill hidden fields.
     * Silently succeed to avoid
     * teaching bots how detection works.
     */
    if (
      body.website &&
      body.website.trim().length > 0
    ) {
      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    /**
     * IP-based rate limiting.
     */
    const ip =
      request.headers.get(
        "x-forwarded-for"
      ) ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many submissions. Please try again later.",
        },
        {
          status: 429,
        }
      );
    }

    /**
     * Server-side email validation.
     */
    if (
      !body.email ||
      !EMAIL_REGEX.test(body.email)
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.auditSlug) {
      return NextResponse.json(
        {
          error:
            "Missing audit reference.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Fetch audit report to personalize email.
     */
    const {
      data: audit,
      error: auditError,
    } = await supabase
      .from("audits")
      .select("report_json")
      .eq("slug", body.auditSlug)
      .single();

    if (auditError || !audit) {
      return NextResponse.json(
        {
          error:
            "Audit report not found.",
        },
        {
          status: 404,
        }
      );
    }

    const report =
      audit.report_json as AuditReport;

    /**
     * Save lead to database.
     */
    const { error: leadError } =
      await supabase
        .from("leads")
        .insert({
          email: body.email,
          company_name: body.companyName,
          role: body.role,
          team_size: body.teamSize,
          audit_slug: body.auditSlug,
          captured_at: new Date().toISOString(),
        });

    if (leadError) {
      console.error(
        "Failed to save lead:",
        leadError
      );

      return NextResponse.json(
        {
          error:
            "Failed to save report.",
        },
        {
          status: 500,
        }
      );
    }

    /**
 * Attach email to audit so stale
 * pricing notifications can be sent later.
 */
    const { error: auditUpdateError } =
      await supabase
        .from("audits")
        .update({
          user_email: body.email,
        })
        .eq("slug", body.auditSlug);

    if (auditUpdateError) {
      console.error(
        "Failed to update audit email:",
        auditUpdateError
      );
    }

    /**
     * Transactional email.
     */
    const highSavings =
      report.totalMonthlySavings >=
      500;

    const savingsText = `$${report.totalMonthlySavings.toLocaleString()}/month`;

    await resend.emails.send({
      from:
        "Leakproof <onboarding@resend.dev>",
      to: body.email,
      subject:
        "Your AI spend audit is ready",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #171717;">
          <h2 style="font-size: 24px; margin-bottom: 12px;">
            Your AI spend audit is ready
          </h2>

          <p style="font-size: 16px; line-height: 1.7;">
            We analyzed your AI tooling stack and identified
            approximately <strong>${savingsText}</strong>
            in potential monthly savings.
          </p>

          <p style="font-size: 16px; line-height: 1.7;">
            You can revisit your report anytime:
          </p>

          <p>
            <a
              href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${report.slug}"
              style="display:inline-block;padding:12px 18px;background:#111827;color:white;text-decoration:none;border-radius:10px;"
            >
              View your audit
            </a>
          </p>

          ${highSavings
          ? `
            <div style="margin-top:24px;padding:18px;border-radius:12px;background:#f5f5f5;">
              <strong>Capture more savings with Credex</strong>
              <p style="margin-top:8px;line-height:1.7;">
                Your audit suggests material savings opportunities.
                Credex can help consolidate overlapping tools,
                reduce procurement waste, and optimize spend across teams.
              </p>
            </div>
          `
          : ""
        }

          <p style="margin-top:32px;color:#737373;font-size:14px;">
            Leakproof — AI Spend Audit
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Lead capture failure:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}