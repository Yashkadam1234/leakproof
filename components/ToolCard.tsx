import { ArrowRight } from "lucide-react";

import type { AuditResult, Tool } from "@/types";

import { TOOLS_CATALOG } from "@/lib/audit-engine";

interface ToolCardProps {
  result: AuditResult;
  planId: string;
}

const statusStyles: Record<
  AuditResult["status"],
  string
> = {
  overspending:
    "border-red-500 bg-red-50/40",
  suboptimal:
    "border-yellow-500 bg-yellow-50/40",
  optimal:
    "border-green-500 bg-green-50/40",
};

export default function ToolCard({
  result,
  planId,
}: ToolCardProps) {
  const tool = TOOLS_CATALOG.find(
    (item) => item.id === result.toolId
  ) as Tool | undefined;

  const plan = tool?.plansAvailable.find(
    (item) => item.id === planId
  );

  return (
    <div
      className={`rounded-2xl border-2 p-6 shadow-sm transition-all ${statusStyles[result.status]}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold tracking-tight">
                {tool?.name ?? "Unknown Tool"}
              </h3>

              <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
                {plan?.name ?? "Unknown Plan"}
              </span>
            </div>

            <p className="mt-2 text-sm text-neutral-500">
              Current monthly spend
            </p>

            <div className="mt-1 text-4xl font-semibold tracking-tight text-neutral-400">
              $
              {result.currentMonthlyCost.toFixed(
                0
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full border border-neutral-200 bg-white p-2">
              <ArrowRight className="h-4 w-4 text-neutral-500" />
            </div>

            <div>
              <p className="text-sm text-neutral-500">
                Recommended action
              </p>

              <p className="mt-1 text-lg font-semibold leading-snug text-neutral-900">
                {result.recommendedAction}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {result.estimatedSavings > 0 ? (
            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Save $
              {result.estimatedSavings.toFixed(0)}
              /mo
            </div>
          ) : result.status === "suboptimal" ? (
            <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
              Review plan
            </div>
          ) : (
            <div className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-600">
              Optimized
            </div>
          )}
          <div className="max-w-sm text-sm leading-6 text-neutral-600 lg:text-right">
            {result.reason}
          </div>
        </div>
      </div>
    </div>
  );
}