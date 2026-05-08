import { describe, expect, it } from "vitest";

import {
  checkAlternativeTool,
  checkPlanFit,
  generateAuditReport,
} from "../lib/audit-engine";

import type { AuditInput } from "../types";

describe("audit-engine", () => {
  /**
   * Validates that small teams should not typically
   * pay for Team-tier collaboration/admin features.
   */
  it("flags Team plan for 2 seats as oversized", () => {
    const input: AuditInput = {
      toolId: "claude",
      planId: "claude-team-standard",
      monthlySpend: 50,
      seats: 2,
      useCase: "writing",
    };

    const result = checkPlanFit(input);

    expect(result.status).toBe("overspending");
  });

  /**
   * Validates that Team plans become operationally
   * reasonable once the organization reaches scale.
   */
  it("does not flag Team plan for 6 seats", () => {
    const input: AuditInput = {
      toolId: "claude",
      planId: "claude-team-standard",
      monthlySpend: 150,
      seats: 6,
      useCase: "coding",
    };

    const result = checkPlanFit(input);

    expect(result.status).toBe("optimal");
  });

  /**
   * Validates that coding-focused users on ChatGPT Plus
   * may have cheaper specialized coding alternatives.
   */
  it("suggests cheaper alternative for ChatGPT Plus used for coding", () => {
    const input: AuditInput = {
      toolId: "chatgpt",
      planId: "chatgpt-plus",
      monthlySpend: 20,
      seats: 3,
      useCase: "coding",
    };

    const result = checkAlternativeTool(input);

    expect(result).not.toBeNull();

    expect(
      result?.recommendedAction.toLowerCase()
    ).toMatch(/cursor|claude|windsurf/);
  });

  /**
   * Validates direct monthly savings calculations
   * for clearly oversized premium subscriptions.
   */
  it("calculates monthly savings correctly", () => {
    const input: AuditInput = {
      toolId: "claude",
      planId: "claude-max",
      monthlySpend: 300,
      seats: 3,
      useCase: "writing",
    };

    const report = generateAuditReport([input], 3);

    expect(report.totalMonthlySavings).toBe(240);
  });

  /**
   * Validates that enterprise-style CTA logic
   * activates for materially large AI spend.
   */
  it("triggers Credex CTA when total spend exceeds $500", () => {
    const inputs: AuditInput[] = [
      {
        toolId: "claude",
        planId: "claude-max",
        monthlySpend: 300,
        seats: 3,
        useCase: "research",
      },
      {
        toolId: "chatgpt",
        planId: "chatgpt-business",
        monthlySpend: 300,
        seats: 10,
        useCase: "mixed",
      },
    ];

    const report = generateAuditReport(inputs, 10);

    expect(report.showCredexCta).toBe(true);
  });

  /**
   * Validates that smaller spend profiles
   * do not trigger enterprise optimization CTAs.
   */
  it("does NOT trigger Credex CTA when total spend is $300", () => {
    const inputs: AuditInput[] = [
      {
        toolId: "chatgpt",
        planId: "chatgpt-plus",
        monthlySpend: 100,
        seats: 5,
        useCase: "writing",
      },
      {
        toolId: "github-copilot",
        planId: "copilot-free",
        monthlySpend: 200,
        seats: 2,
        useCase: "coding",
      },
    ];

    const report = generateAuditReport(inputs, 5);

    expect(report.showCredexCta).toBe(false);
  });

  /**
   * Validates that correctly-sized individual plans
   * are marked as financially appropriate.
   */
  it("marks user as optimal when on correct plan", () => {
    const input: AuditInput = {
      toolId: "github-copilot",
      planId: "copilot-free",
      monthlySpend: 10,
      seats: 1,
      useCase: "coding",
    };

    const result = checkPlanFit(input);

    expect(result.status).toBe("optimal");
  });

  /**
   * Validates that annual savings are always derived
   * from monthly savings using a 12-month multiplier.
   */
  it("total annual savings is 12x monthly", () => {
    const inputs: AuditInput[] = [
      {
        toolId: "claude",
        planId: "claude-max",
        monthlySpend: 300,
        seats: 3,
        useCase: "writing",
      },
    ];

    const report = generateAuditReport(inputs, 3);

    expect(report.totalAnnualSavings).toBe(
      report.totalMonthlySavings * 12
    );
  });
});