import type { AuditReport } from "@/types";
import { TOOLS_CATALOG } from "@/lib/audit-engine";


const ANTHROPIC_API_URL =
  "https://api.anthropic.com/v1/messages";

export const FULL_PROMPT = `
You are generating a concise AI infrastructure and SaaS spend analysis summary.

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

The paragraph should feel like something a CTO would forward internally.

Audit report data:
`;

function buildFallbackSummary(
  report: AuditReport
): string {
  const toolNames = report.inputs
    .map((i) => {
      const tool = TOOLS_CATALOG.find((t) => t.id === i.toolId);
      return tool?.name ?? i.toolId;
    })
    .join(", ");

  const overspendingCount = report.results.filter(
    (result) => result.status === "overspending"
  ).length;

  const optimizedCount = report.results.filter(
    (result) => result.status === "optimal"
  ).length;

  const toolCount = report.inputs.length;

  if (report.totalMonthlySavings < 100) {
    return `Your current AI tooling stack appears relatively efficient across ${toolCount} active tool${toolCount > 1 ? "s" : ""}, with limited unnecessary spend identified during the audit. Most subscriptions appear appropriately matched to team size and workflow requirements, particularly across ${toolNames}. While there may still be opportunities to consolidate procurement and monitor seat utilization as adoption grows, the current setup does not show major signs of duplicated tooling or oversized enterprise commitments. Continuing to review usage patterns quarterly will help maintain cost efficiency as AI vendors frequently adjust pricing, packaging, and feature availability.`;
  }

  return `We identified approximately $${report.totalMonthlySavings.toLocaleString()}/month in potential AI tooling savings across ${toolCount} active subscription${toolCount > 1 ? "s" : ""}. The largest optimization opportunities come from oversized plans, overlapping capabilities, and premium tiers that may not fully align with the team's current workflows. ${overspendingCount > 0 ? `Several tools appear materially over-provisioned for current usage patterns, while ${optimizedCount} subscription${optimizedCount !== 1 ? "s" : ""} already appear well aligned with operational needs.` : `Most tools are reasonably aligned operationally, though targeted consolidation opportunities still exist.`} Based on the current stack, reducing unnecessary spend should be achievable without materially impacting developer productivity or day-to-day collaboration workflows.`;
}

export async function generateAuditSummary(
  report: AuditReport
): Promise<string> {
  const apiKey =
    process.env.ANTHROPIC_API_KEY;

  /**
   * If the API key does not exist,
   * immediately return the fallback summary.
   */
  if (!apiKey) {
    return buildFallbackSummary(report);
  }

  const payload = {
    model: "claude-3-haiku-20240307",
    max_tokens: 180,
    temperature: 0.4,
    messages: [
      {
        role: "user",
        content: `${FULL_PROMPT}

${JSON.stringify(report, null, 2)}

Return ONLY the paragraph.`,
      },
    ],
  };

  try {
    /**
     * Abort requests that take too long.
     * Slow AI responses degrade UX heavily
     * on the results page.
     */
    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    const response = await fetch(
      ANTHROPIC_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          "x-api-key": apiKey,
          "anthropic-version":
            "2023-06-01",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    /**
     * Handle:
     * - 429 rate limits
     * - 5xx errors
     * - invalid auth
     * - malformed responses
     */
    if (!response.ok) {
      return buildFallbackSummary(report);
    }

    const data = (await response.json()) as {
      content?: Array<{
        type: string;
        text?: string;
      }>;
    };

    const text =
      data.content?.[0]?.text?.trim();

    /**
     * If Anthropic returns an empty or
     * malformed payload, gracefully fallback.
     */
    if (!text || text.length < 40) {
      return buildFallbackSummary(report);
    }

    return text;
  } catch {
    /**
     * Covers:
     * - timeouts
     * - DNS/network failures
     * - aborted requests
     * - fetch runtime issues
     */
    return buildFallbackSummary(report);
  }
}