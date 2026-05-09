import { NextRequest, NextResponse } from "next/server";

import type { AuditInput } from "@/types";

import { generateAuditReport } from "@/lib/audit-engine";
import { generateAuditSummary } from "@/lib/anthropic";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

const MAX_INPUTS = 8;

function isValidUseCase(
  value: string
): value is AuditInput["useCase"] {
  return [
    "coding",
    "writing",
    "data",
    "research",
    "mixed",
  ].includes(value);
}

function validateInputs(
  inputs: unknown,
  teamSize: unknown
): {
  valid: boolean;
  error?: string;
} {
  if (!Array.isArray(inputs)) {
    return {
      valid: false,
      error: "Inputs must be an array.",
    };
  }

  if (inputs.length === 0) {
    return {
      valid: false,
      error:
        "At least one tool must be submitted.",
    };
  }

  if (inputs.length > MAX_INPUTS) {
    return {
      valid: false,
      error:
        "Too many tools submitted in a single audit.",
    };
  }

  if (
    typeof teamSize !== "number" ||
    Number.isNaN(teamSize) ||
    teamSize < 1
  ) {
    return {
      valid: false,
      error: "Invalid team size.",
    };
  }

  for (const input of inputs) {
    if (
      typeof input !== "object" ||
      input === null
    ) {
      return {
        valid: false,
        error: "Invalid audit input.",
      };
    }

    const candidate =
      input as Partial<AuditInput>;

    if (
      typeof candidate.toolId !== "string" ||
      candidate.toolId.length === 0
    ) {
      return {
        valid: false,
        error: "Invalid tool ID.",
      };
    }

    if (
      typeof candidate.planId !== "string" ||
      candidate.planId.length === 0
    ) {
      return {
        valid: false,
        error: "Invalid plan ID.",
      };
    }

    if (
      typeof candidate.monthlySpend !==
      "number" ||
      Number.isNaN(candidate.monthlySpend) ||
      candidate.monthlySpend <= 0
    ) {
      return {
        valid: false,
        error:
          "Monthly spend must be greater than 0.",
      };
    }

    if (
      typeof candidate.seats !== "number" ||
      Number.isNaN(candidate.seats) ||
      candidate.seats < 1
    ) {
      return {
        valid: false,
        error:
          "Seat count must be at least 1.",
      };
    }

    if (
      typeof candidate.useCase !== "string" ||
      !isValidUseCase(candidate.useCase)
    ) {
      return {
        valid: false,
        error: "Invalid use case.",
      };
    }
  }

  return {
    valid: true,
  };
}

export async function POST(
  request: NextRequest
) {
  try {
    /**
     * IP-based rate limiting.
     *
     * Restricts abuse/spam audit generation
     * while keeping the tool accessible
     * without requiring auth.
     */
    const ip =
      request.headers.get(
        "x-forwarded-for"
      ) ?? "unknown";

    const limited = rateLimit(ip);
    if (limited) {
      return Response.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      inputs?: unknown;
      teamSize?: unknown;
    };

    const validation = validateInputs(
      body.inputs,
      body.teamSize
    );

    /**
     * Never trust client-side validation.
     */
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        {
          status: 400,
        }
      );
    }

    const inputs =
      body.inputs as AuditInput[];

    const teamSize =
      body.teamSize as number;

    /**
     * Generate deterministic financial analysis.
     */
    const report = generateAuditReport(
      inputs,
      teamSize
    );

    /**
     * Generate narrative AI summary.
     * Falls back gracefully if AI fails.
     */
    const aiSummary =
      await generateAuditSummary(report);

    const finalReport = {
      ...report,
      aiSummary,
    };

    /**
     * Persist report for public sharing.
     */
    const { error } = await supabase
      .from("audits")
      .insert({
        slug: finalReport.slug,
        report_json: finalReport,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error(
        "Failed to save audit:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to persist audit report.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        slug: finalReport.slug,
        report: finalReport,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Audit route failure:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected server error while generating audit.",
      },
      {
        status: 500,
      }
    );
  }
}