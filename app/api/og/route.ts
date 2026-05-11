import React from "react";
import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

import { supabase } from "@/lib/supabase";
import type { AuditReport } from "@/types";

export const runtime = "edge";

export const contentType =
  "image/png";

const WIDTH = 1200;
const HEIGHT = 630;

interface AuditRow {
  report_json: AuditReport;
}

function createDefaultImage() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent:
            "space-between",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: "56px",
          fontFamily:
            "ui-sans-serif, system-ui, sans-serif",
        },
      },

      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
          },
        },

        React.createElement(
          "div",
          {
            style: {
              fontSize: 34,
              fontWeight: 700,
              marginBottom: 42,
            },
          },
          "Leakproof"
        ),

        React.createElement(
          "div",
          {
            style: {
              fontSize: 88,
              fontWeight: 800,
              color: "#22c55e",
              lineHeight: 1,
              letterSpacing:
                "-0.04em",
            },
          },
          "Reduce AI spend"
        ),

        React.createElement(
          "div",
          {
            style: {
              marginTop: 24,
              fontSize: 40,
              color:
                "rgba(255,255,255,0.72)",
              maxWidth: "800px",
              lineHeight: 1.2,
            },
          },
          "Audit oversized subscriptions, overlapping AI tools, and wasted spend."
        )
      ),

      React.createElement(
        "div",
        {
          style: {
            fontSize: 24,
            color:
              "rgba(255,255,255,0.55)",
          },
        },
        "AI Spend Audit"
      )
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

function createAuditImage(
  report: AuditReport
) {
  const monthlySavings =
    report.totalMonthlySavings.toLocaleString();

  const annualSavings =
    report.totalAnnualSavings.toLocaleString();

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent:
            "space-between",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: "56px",
          fontFamily:
            "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
        },
      },

      /**
       * Subtle glow accent
       */
      React.createElement("div", {
        style: {
          position: "absolute",
          top: "-140px",
          right: "-120px",
          width: "420px",
          height: "420px",
          borderRadius: "9999px",
          background:
            "rgba(34,197,94,0.12)",
          filter: "blur(90px)",
        },
      }),

      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
          },
        },

        /**
         * Brand
         */
        React.createElement(
          "div",
          {
            style: {
              fontSize: 34,
              fontWeight: 700,
              marginBottom: 48,
            },
          },
          "Leakproof"
        ),

        /**
         * Savings headline
         */
        React.createElement(
          "div",
          {
            style: {
              fontSize: 96,
              fontWeight: 800,
              color: "#22c55e",
              lineHeight: 1,
              letterSpacing:
                "-0.05em",
            },
          },
          `Save $${monthlySavings}/month`
        ),

        /**
         * Subtitle
         */
        React.createElement(
          "div",
          {
            style: {
              marginTop: 24,
              fontSize: 42,
              color:
                "rgba(255,255,255,0.82)",
              maxWidth: "900px",
              lineHeight: 1.25,
            },
          },
          `This team could save $${annualSavings}/year on AI tools`
        )
      ),

      /**
       * Footer
       */
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            zIndex: 2,
          },
        },

        React.createElement(
          "div",
          {
            style: {
              fontSize: 24,
              color:
                "rgba(255,255,255,0.55)",
            },
          },
          "AI Spend Audit"
        ),

        React.createElement(
          "div",
          {
            style: {
              fontSize: 20,
              padding: "10px 18px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px",
              color:
                "rgba(255,255,255,0.75)",
              background:
                "rgba(255,255,255,0.04)",
            },
          },
          "leakproof.ai"
        )
      )
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

export async function GET(
  request: NextRequest
): Promise<Response> {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const slug =
      searchParams.get("slug");

    /**
     * Missing slug → default image.
     */
    if (!slug) {
      return createDefaultImage();
    }

    const { data, error } =
      await supabase
        .from("audits")
        .select("report_json")
        .eq("slug", slug)
        .single<AuditRow>();

    /**
     * Slug not found → default image.
     */
    if (error || !data) {
      return createDefaultImage();
    }

    const report =
      data.report_json;

    return createAuditImage(
      report
    );
  } catch (error) {
    console.error(
      "OG image generation failed:",
      error
    );

    /**
     * Any runtime failure →
     * fallback image.
     */
    return createDefaultImage();
  }
}