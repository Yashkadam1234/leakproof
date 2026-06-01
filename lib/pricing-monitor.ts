import { getCurrentPricingSnapshot } from "@/lib/pricing-snapshot";
import { supabase } from "@/lib/supabase";
import { generateAuditReport } from "@/lib/audit-engine";

import type {
  AuditInput,
  AuditReport,
  PricingSnapshot,
  Tool,
} from "@/types";

export interface PricingChange {
  toolId: string;
  toolName: string;
  planId: string;
  planName: string;
  oldPrice: number;
  newPrice: number;
  changeType:
  | "price_increase"
  | "price_decrease"
  | "plan_added"
  | "plan_removed";
}

export interface AffectedAudit {
  slug: string;
  userEmail: string;
  changes: PricingChange[];
  oldReport: AuditReport;
  newReport: AuditReport;
}

/**
 * Convert pricing snapshot into
 * a Tool[] catalog compatible with
 * generateAuditReport().
 */
function snapshotToCatalog(
  snapshot: PricingSnapshot
): Tool[] {
  return Object.entries(snapshot.tools).map(
    ([toolId, toolData]) => ({
      id: toolId,
      name: toolId,
      plansAvailable: Object.entries(
        toolData.plans
      ).map(([planId, planData]) => ({
        id: planId,
        name: planData.name,
        pricePerSeat:
          planData.pricePerSeat,
        billingType: "per_seat",
      })),
    })
  );
}

/**
 * Detect pricing differences
 * between current pricing and
 * a stored snapshot.
 */
export function detectPricingChanges(
  currentSnapshot: PricingSnapshot,
  storedSnapshot: PricingSnapshot
): PricingChange[] {
  const changes: PricingChange[] = [];

  const currentTools =
    currentSnapshot.tools;

  const storedTools =
    storedSnapshot.tools;

  for (const [
    toolId,
    storedTool,
  ] of Object.entries(storedTools)) {
    const currentTool =
      currentTools[toolId];

    if (!currentTool) {
      continue;
    }

    /**
     * Existing plans
     */
    for (const [
      planId,
      storedPlan,
    ] of Object.entries(
      storedTool.plans
    )) {
      const currentPlan =
        currentTool.plans[planId];

      /**
       * Plan removed
       */
      if (!currentPlan) {
        changes.push({
          toolId,
          toolName: toolId,
          planId,
          planName: storedPlan.name,
          oldPrice:
            storedPlan.pricePerSeat,
          newPrice: 0,
          changeType:
            "plan_removed",
        });

        continue;
      }

      /**
       * Price changed
       */
      if (
        storedPlan.pricePerSeat !==
        currentPlan.pricePerSeat
      ) {
        changes.push({
          toolId,
          toolName: toolId,
          planId,
          planName:
            currentPlan.name,
          oldPrice:
            storedPlan.pricePerSeat,
          newPrice:
            currentPlan.pricePerSeat,
          changeType:
            currentPlan.pricePerSeat >
              storedPlan.pricePerSeat
              ? "price_increase"
              : "price_decrease",
        });
      }
    }

    /**
     * Newly added plans
     */
    for (const [
      planId,
      currentPlan,
    ] of Object.entries(
      currentTool.plans
    )) {
      const existed =
        storedTool.plans[planId];

      if (!existed) {
        changes.push({
          toolId,
          toolName: toolId,
          planId,
          planName:
            currentPlan.name,
          oldPrice: 0,
          newPrice:
            currentPlan.pricePerSeat,
          changeType:
            "plan_added",
        });
      }
    }
  }

  return changes;
}

/**
 * Determines whether rerunning
 * the audit under updated pricing
 * changes recommendations.
 */
export function wouldAuditChange(
  inputs: AuditInput[],
  oldSnapshot: PricingSnapshot,
  newSnapshot: PricingSnapshot
): boolean {
  const oldCatalog =
    snapshotToCatalog(oldSnapshot);

  const newCatalog =
    snapshotToCatalog(newSnapshot);

  /**
   * Infer team size from inputs.
   * Round 1 report does not store it.
   */
  const teamSize = Math.max(
    ...inputs.map(
      (input) => input.seats
    ),
    1
  );

  const oldReport =
    generateAuditReport(
      inputs,
      teamSize,
      oldCatalog
    );

  const newReport =
    generateAuditReport(
      inputs,
      teamSize,
      newCatalog
    );

  /**
   * Compare recommendation output.
   */
  return (
    JSON.stringify(
      oldReport.results
    ) !==
    JSON.stringify(
      newReport.results
    ) ||
    oldReport
      .totalMonthlySavings !==
    newReport.totalMonthlySavings
  );
}

/**
 * Find audits affected by
 * pricing changes.
 */
export async function getAffectedAudits(): Promise<
  AffectedAudit[]
> {
  const affected: AffectedAudit[] =
    [];

  /**
   * Current pricing snapshot
   * from live catalog.
   */
  const currentSnapshot = getCurrentPricingSnapshot();
  const { data, error } =
    await supabase
      .from("audits")
      .select("*")
      .not(
        "pricing_snapshot",
        "is",
        null
      )
      .eq("is_stale", false);

  if (error || !data) {
    throw new Error(
      "Failed to fetch audits"
    );
  }

  for (const audit of data) {
    const storedSnapshot =
      audit.pricing_snapshot as PricingSnapshot;

    const report =
      audit.report_json as AuditReport;

    const changes =
      detectPricingChanges(
        currentSnapshot,
        storedSnapshot
      );

    if (changes.length === 0) {
      continue;
    }

    const changed =
      wouldAuditChange(
        report.inputs,
        storedSnapshot,
        currentSnapshot
      );

    const affectedPlanIds = new Set(
      changes.map((change) => change.planId)
    );

    const auditUsesChangedPlan = report.inputs.some(
      (input) => affectedPlanIds.has(input.planId)
    );

    if (!changed && !auditUsesChangedPlan) {
      continue;
    }

    const newReport =
      generateAuditReport(
        report.inputs,
        Math.max(
          ...report.inputs.map(
            (i) => i.seats
          ),
          1
        )
      );

    affected.push({
      slug: report.slug,
      userEmail:
        audit.user_email ?? "",
      changes,
      oldReport: report,
      newReport,
    });
  }

  return affected;
}