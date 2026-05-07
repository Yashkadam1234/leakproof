import { nanoid } from "nanoid";
import {
  AuditInput,
  AuditReport,
  AuditResult,
  BillingType,
  Plan,
  Tool,
} from "@/types";

export const TOOLS_CATALOG: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    plansAvailable: [
      {
        id: "cursor-hobby",
        name: "Hobby",
        pricePerSeat: 0,
        billingType: "flat",
      },
      {
        id: "cursor-pro",
        name: "Pro",
        pricePerSeat: 20,
        billingType: "per_seat",
      },
      {
        id: "cursor-business",
        name: "Business",
        pricePerSeat: 40,
        billingType: "per_seat",
      },
      {
        id: "cursor-enterprise",
        name: "Enterprise",
        pricePerSeat: 0,
        billingType: "flat",
      },
    ],
  },

  {
    id: "github-copilot",
    name: "GitHub Copilot",
    plansAvailable: [
      {
        id: "copilot-individual",
        name: "Individual",
        pricePerSeat: 10,
        billingType: "per_seat",
      },
      {
        id: "copilot-business",
        name: "Business",
        pricePerSeat: 19,
        billingType: "per_seat",
      },
      {
        id: "copilot-enterprise",
        name: "Enterprise",
        pricePerSeat: 39,
        billingType: "per_seat",
      },
    ],
  },

  {
    id: "claude",
    name: "Claude",
    plansAvailable: [
      {
        id: "claude-free",
        name: "Free",
        pricePerSeat: 0,
        billingType: "flat",
      },
      {
        id: "claude-pro",
        name: "Pro",
        pricePerSeat: 20,
        billingType: "per_seat",
      },
      {
        id: "claude-max",
        name: "Max",
        pricePerSeat: 100,
        billingType: "per_seat",
      },
      {
        id: "claude-team",
        name: "Team",
        pricePerSeat: 30,
        billingType: "per_seat",
      },
      {
        id: "claude-enterprise",
        name: "Enterprise",
        pricePerSeat: 0,
        billingType: "flat",
      },
    ],
  },

  {
    id: "chatgpt",
    name: "ChatGPT",
    plansAvailable: [
      {
        id: "chatgpt-plus",
        name: "Plus",
        pricePerSeat: 20,
        billingType: "per_seat",
      },
      {
        id: "chatgpt-team",
        name: "Team",
        pricePerSeat: 30,
        billingType: "per_seat",
      },
      {
        id: "chatgpt-enterprise",
        name: "Enterprise",
        pricePerSeat: 0,
        billingType: "flat",
      },
    ],
  },

  {
    id: "anthropic-api",
    name: "Anthropic API",
    plansAvailable: [
      {
        id: "anthropic-api-usage",
        name: "Usage Based",
        pricePerSeat: 0,
        billingType: "usage_based",
      },
    ],
  },

  {
    id: "openai-api",
    name: "OpenAI API",
    plansAvailable: [
      {
        id: "openai-api-usage",
        name: "Usage Based",
        pricePerSeat: 0,
        billingType: "usage_based",
      },
    ],
  },

  {
    id: "gemini",
    name: "Gemini",
    plansAvailable: [
      {
        id: "gemini-free",
        name: "Free",
        pricePerSeat: 0,
        billingType: "flat",
      },
      {
        id: "gemini-ultra",
        name: "Ultra",
        pricePerSeat: 19.99,
        billingType: "per_seat",
      },
      {
        id: "gemini-api",
        name: "API",
        pricePerSeat: 0,
        billingType: "usage_based",
      },
    ],
  },

  {
    id: "windsurf",
    name: "Windsurf",
    plansAvailable: [
      {
        id: "windsurf-free",
        name: "Free",
        pricePerSeat: 0,
        billingType: "flat",
      },
      {
        id: "windsurf-pro",
        name: "Pro",
        pricePerSeat: 15,
        billingType: "per_seat",
      },
      {
        id: "windsurf-teams",
        name: "Teams",
        pricePerSeat: 35,
        billingType: "per_seat",
      },
    ],
  },
];

/**
 * Utility helper to locate a tool by ID.
 */
function getTool(toolId: string): Tool | undefined {
  return TOOLS_CATALOG.find((tool) => tool.id === toolId);
}

/**
 * Utility helper to locate a plan inside a tool.
 */
function getPlan(tool: Tool, planId: string): Plan | undefined {
  return tool.plansAvailable.find((plan) => plan.id === planId);
}

/**
 * Rule-based evaluation of whether the user's current plan
 * matches their actual operational needs.
 *
 * These checks intentionally mimic how a finance/procurement
 * team would review SaaS spend:
 *
 * - Are enterprise/admin features being paid for too early?
 * - Is the company under-buying and creating governance risk?
 * - Is premium pricing justified by workload intensity?
 */
export function checkPlanFit(input: AuditInput): AuditResult {
  const tool = getTool(input.toolId);

  if (!tool) {
    throw new Error(`Tool not found: ${input.toolId}`);
  }

  const plan = getPlan(tool, input.planId);

  if (!plan) {
    throw new Error(`Plan not found: ${input.planId}`);
  }

  const currentMonthlyCost = input.monthlySpend;

  /**
   * Team/business plans generally include:
   * - admin controls
   * - SSO
   * - centralized billing
   * - governance
   * - analytics
   *
   * For very small teams (<5 seats), those features
   * usually do not justify the higher seat pricing.
   */
  const isTeamPlan =
    plan.name.toLowerCase().includes("team") ||
    plan.name.toLowerCase().includes("business");

  if (isTeamPlan && input.seats < 5) {
    return {
      toolId: input.toolId,
      currentMonthlyCost,
      recommendedAction: "Downgrade to an individual/pro plan",
      estimatedSavings:
        (plan.pricePerSeat - 20) * input.seats > 0
          ? (plan.pricePerSeat - 20) * input.seats
          : 0,
      reason:
        "Team/business plans typically become cost-effective only once admin and governance overhead matters across multiple users.",
      status: "overspending",
    };
  }

  /**
   * Individual/hobby plans become operationally risky
   * at larger seat counts because they lack:
   * - centralized access control
   * - audit visibility
   * - team billing
   * - onboarding/offboarding controls
   *
   * At 10+ seats, procurement usually expects centralized management.
   */
  const isIndividualPlan =
    plan.name.toLowerCase().includes("individual") ||
    plan.name.toLowerCase().includes("hobby") ||
    plan.name.toLowerCase().includes("pro") ||
    plan.name.toLowerCase().includes("plus");

  if (isIndividualPlan && input.seats >= 10) {
    return {
      toolId: input.toolId,
      currentMonthlyCost,
      recommendedAction: "Upgrade to a team/business plan",
      estimatedSavings: 0,
      reason:
        "Larger teams generally benefit from centralized admin, billing, and governance controls that individual plans do not provide.",
      status: "suboptimal",
    };
  }

  /**
   * Claude Max at $100/user/month is a premium productivity tier.
   *
   * That pricing is usually only financially justified for:
   * - heavy coding workflows
   * - advanced research workflows
   * - users generating extremely high token usage
   *
   * Simpler writing/data workflows on very small teams
   * typically do not realize enough productivity gain
   * to justify the cost differential.
   */
  const isClaudeMax = plan.id === "claude-max";

  if (
    isClaudeMax &&
    (input.useCase === "writing" || input.useCase === "data") &&
    input.seats < 5
  ) {
    return {
      toolId: input.toolId,
      currentMonthlyCost,
      recommendedAction: "Downgrade from Claude Max to Claude Pro",
      estimatedSavings: (100 - 20) * input.seats,
      reason:
        "Claude Max pricing is generally only justified for extremely heavy technical or research-intensive workloads.",
      status: "overspending",
    };
  }

  return {
    toolId: input.toolId,
    currentMonthlyCost,
    recommendedAction: "Current plan appears appropriate",
    estimatedSavings: 0,
    reason: "No meaningful pricing or operational mismatch detected.",
    status: "optimal",
  };
}

/**
 * Determines whether the same vendor offers
 * a meaningfully cheaper plan that still satisfies
 * the user's likely operational needs.
 *
 * This avoids recommending vendor migration when
 * a simpler downgrade inside the same ecosystem
 * would already reduce spend.
 */
export function checkCheaperSameTool(
  input: AuditInput
): AuditResult | null {
  const tool = getTool(input.toolId);

  if (!tool) {
    return null;
  }

  const currentPlan = getPlan(tool, input.planId);

  if (!currentPlan) {
    return null;
  }

  /**
   * Claude Max -> Claude Pro downgrade rule.
   *
   * If workload is not deeply technical and the team
   * is small, the incremental value of Max is likely low.
   */
  if (
    currentPlan.id === "claude-max" &&
    input.seats < 5 &&
    input.useCase !== "coding" &&
    input.useCase !== "research"
  ) {
    return {
      toolId: input.toolId,
      currentMonthlyCost: input.monthlySpend,
      recommendedAction: "Switch to Claude Pro",
      estimatedSavings: (100 - 20) * input.seats,
      reason:
        "Claude Pro usually delivers similar value for lighter workflows at substantially lower cost.",
      status: "overspending",
    };
  }

  /**
   * ChatGPT Team for very small teams often
   * creates unnecessary admin overhead cost.
   */
  if (currentPlan.id === "chatgpt-team" && input.seats < 5) {
    return {
      toolId: input.toolId,
      currentMonthlyCost: input.monthlySpend,
      recommendedAction: "Switch to ChatGPT Plus",
      estimatedSavings: (30 - 20) * input.seats,
      reason:
        "Small teams often do not utilize enough team-level controls to justify higher seat pricing.",
      status: "overspending",
    };
  }

  return null;
}

/**
 * Cross-vendor comparison engine.
 *
 * Important:
 * - We only recommend alternatives when savings are REAL.
 * - We avoid fake optimization recommendations.
 * - Savings must exceed $5/user/month to avoid noisy advice.
 *
 * The recommendation must also make practical sense
 * for the stated workflow.
 */
export function checkAlternativeTool(
  input: AuditInput
): AuditResult | null {
  /**
   * Cursor vs Windsurf:
   *
   * Windsurf Pro is meaningfully cheaper than Cursor Pro.
   * For smaller coding teams, feature overlap is often sufficient.
   *
   * Savings:
   * $20 -> $15 = $5/user/month
   */
  if (
    input.toolId === "cursor" &&
    input.useCase === "coding" &&
    input.monthlySpend > 0
  ) {
    const savings = 5 * input.seats;

    if (savings > 5) {
      return {
        toolId: input.toolId,
        currentMonthlyCost: input.monthlySpend,
        recommendedAction: "Evaluate Windsurf Pro as an alternative",
        estimatedSavings: savings,
        reason:
          "Windsurf Pro may provide similar coding assistance at a lower per-seat cost for smaller engineering teams.",
        status: "suboptimal",
      };
    }
  }

  /**
   * Claude Max vs ChatGPT Plus:
   *
   * For general writing workflows, Claude Max pricing
   * can significantly exceed practical productivity gains.
   */
  if (
    input.toolId === "claude" &&
    input.planId === "claude-max" &&
    input.useCase === "writing"
  ) {
    const savings = (100 - 20) * input.seats;

    if (savings / input.seats > 5) {
      return {
        toolId: input.toolId,
        currentMonthlyCost: input.monthlySpend,
        recommendedAction: "Evaluate ChatGPT Plus for writing workflows",
        estimatedSavings: savings,
        reason:
          "For many writing-focused teams, lower-cost general AI assistants can deliver comparable utility.",
        status: "overspending",
      };
    }
  }
  
  /**
   * ChatGPT Plus for coding workflows:
   * Cursor Pro is purpose-built for coding at the same price.
   * Switching gives better IDE integration at no extra cost.
   */
  if (
    input.toolId === "chatgpt" &&
    input.useCase === "coding"
  ) {
    return {
      toolId: input.toolId,
      currentMonthlyCost: input.monthlySpend,
      recommendedAction: "Evaluate Cursor Pro for coding workflows",
      estimatedSavings: 0,
      reason:
        "Cursor Pro is purpose-built for coding with IDE integration at the same price point as ChatGPT Plus.",
      status: "suboptimal",
    };
  }

  return null;
}

/**
 * Credex CTA trigger.
 *
 * High AI spend usually correlates with:
 * - fragmented procurement
 * - duplicated tooling
 * - unmanaged seat growth
 * - finance visibility gaps
 *
 * At >$500/month, centralized optimization
 * conversations become commercially relevant.
 */
export function checkCredexOpportunity(
  totalSpend: number
): boolean {
  return totalSpend > 500;
}

/**
 * Main orchestration engine.
 *
 * Responsibilities:
 * - run all optimization checks
 * - select the strongest recommendation
 * - aggregate savings
 * - generate report metadata
 *
 * This function is intentionally PURE:
 * - no API calls
 * - no DB access
 * - no mutations
 */
export function generateAuditReport(
  inputs: AuditInput[],
  teamSize: number
): AuditReport {
  const results: AuditResult[] = [];

  for (const input of inputs) {
    const planFit = checkPlanFit(input);
    const cheaperSameTool = checkCheaperSameTool(input);
    const alternativeTool = checkAlternativeTool(input);

    /**
     * We gather all candidate recommendations
     * and pick the financially strongest one.
     */
    const candidates: AuditResult[] = [
      planFit,
      ...(cheaperSameTool ? [cheaperSameTool] : []),
      ...(alternativeTool ? [alternativeTool] : []),
    ];

    /**
     * Highest savings recommendation wins.
     *
     * This mirrors how procurement teams prioritize:
     * largest measurable ROI first.
     */
    const bestRecommendation = candidates.reduce((best, current) => {
      return current.estimatedSavings > best.estimatedSavings
        ? current
        : best;
    });

    results.push(bestRecommendation);
  }

  const totalMonthlySavings = results.reduce(
    (sum, result) => sum + result.estimatedSavings,
    0
  );

  const totalAnnualSavings = totalMonthlySavings * 12;

  const totalSpend = inputs.reduce(
    (sum, input) => sum + input.monthlySpend,
    0
  );

  /**
   * Credex CTA shown when:
   * - savings opportunity is substantial
   * OR
   * - operational AI spend is already meaningful
   */
  const showCredexCta =
    totalMonthlySavings > 500 ||
    checkCredexOpportunity(totalSpend);

  return {
    slug: nanoid(10),
    inputs,
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    aiSummary:
      totalMonthlySavings > 0
        ? `We identified approximately $${totalMonthlySavings.toFixed(
            2
          )}/month in potential AI tooling savings.`
        : "Current AI tooling spend appears reasonably optimized.",
    createdAt: new Date().toISOString(),
    showCredexCta,
  };
}