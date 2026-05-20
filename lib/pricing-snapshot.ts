import { TOOLS_CATALOG } from "@/lib/audit-engine";
import type { PricingSnapshot } from "@/types";

/**
 * Creates a deterministic pricing snapshot
 * from the current TOOLS_CATALOG.
 *
 * Purpose:
 * - preserve the exact pricing used at audit time
 * - detect stale audits later when pricing changes
 * - support notification diffs in Round 2
 */
export function getCurrentPricingSnapshot(): PricingSnapshot {
  return {
    version: new Date().toISOString(),
    tools: Object.fromEntries(
      TOOLS_CATALOG.map((tool) => [
        tool.id,
        {
          plans: Object.fromEntries(
            tool.plansAvailable.map((plan) => [
              plan.id,
              {
                name: plan.name,
                pricePerSeat: plan.pricePerSeat,
              },
            ])
          ),
        },
      ])
    ),
  };
}