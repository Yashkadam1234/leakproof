"use client";

import { useMemo, useState } from "react";

import { TOOLS_CATALOG } from "@/lib/audit-engine";

import type {
  AuditDiff as AuditDiffRow,
  AuditReport,
  AuditResult,
} from "@/types";

interface AuditDiffProps {
  oldReport: AuditReport;
  newReport: AuditReport;
}

function getToolName(toolId: string): string {
  return (
    TOOLS_CATALOG.find((tool) => tool.id === toolId)?.name ?? toolId
  );
}

function getResultSummary(result: AuditResult): string {
  return `${result.recommendedAction} — saves $${result.estimatedSavings.toLocaleString()}/mo`;
}

function getRowClassName(diff: AuditDiffRow): string {
  if (!diff.changed) {
    return "bg-neutral-50 text-neutral-700";
  }

  if (diff.savingsDelta > 0) {
    return "bg-green-50 text-green-900";
  }

  if (diff.savingsDelta < 0) {
    return "bg-red-50 text-red-900";
  }

  return "bg-neutral-50 text-neutral-700";
}

function getChangeLabel(diff: AuditDiffRow): string {
  if (!diff.changed) {
    return "No change";
  }

  if (diff.savingsDelta > 0) {
    return `+$${diff.savingsDelta.toLocaleString()}/mo`;
  }

  if (diff.savingsDelta < 0) {
    return `-$${Math.abs(diff.savingsDelta).toLocaleString()}/mo`;
  }

  return "Recommendation changed";
}

export default function AuditDiff({
  oldReport,
  newReport,
}: AuditDiffProps) {
  const [showUnchanged, setShowUnchanged] = useState(false);

  const diffs = useMemo<AuditDiffRow[]>(() => {
    return oldReport.results.map((oldResult) => {
      const newResult =
        newReport.results.find(
          (result) => result.toolId === oldResult.toolId
        ) ?? oldResult;

      const savingsDelta =
        newResult.estimatedSavings - oldResult.estimatedSavings;

      const changed =
        oldResult.recommendedAction !== newResult.recommendedAction ||
        oldResult.estimatedSavings !== newResult.estimatedSavings ||
        oldResult.status !== newResult.status ||
        oldResult.reason !== newResult.reason;

      return {
        toolId: oldResult.toolId,
        toolName: getToolName(oldResult.toolId),
        oldResult,
        newResult,
        savingsDelta,
        changed,
      };
    });
  }, [oldReport.results, newReport.results]);

  const changedRows = diffs.filter((diff) => diff.changed);
  const unchangedRows = diffs.filter((diff) => !diff.changed);

  const visibleRows = showUnchanged
    ? diffs
    : changedRows;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Recommendation changes
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Comparing your original audit against the latest pricing rules.
          </p>
        </div>

        {unchangedRows.length > 0 && (
          <button
            type="button"
            onClick={() => setShowUnchanged((value) => !value)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {showUnchanged
              ? "Hide unchanged"
              : `Show ${unchangedRows.length} unchanged`}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Tool
                </th>
                <th className="px-5 py-4 font-semibold">
                  Old Recommendation
                </th>
                <th className="px-5 py-4 font-semibold">
                  New Recommendation
                </th>
                <th className="px-5 py-4 font-semibold">
                  Change
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-neutral-500"
                  >
                    No recommendation changes found.
                  </td>
                </tr>
              ) : (
                visibleRows.map((diff) => (
                  <tr
                    key={diff.toolId}
                    className={`border-t border-neutral-200 ${getRowClassName(
                      diff
                    )}`}
                  >
                    <td className="px-5 py-5 font-semibold">
                      {diff.toolName}
                    </td>

                    <td className="px-5 py-5 align-top">
                      <div className="font-medium">
                        {getResultSummary(diff.oldResult)}
                      </div>

                      <p className="mt-1 text-xs opacity-75">
                        {diff.oldResult.reason}
                      </p>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <div className="font-medium">
                        {getResultSummary(diff.newResult)}
                      </div>

                      <p className="mt-1 text-xs opacity-75">
                        {diff.newResult.reason}
                      </p>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold shadow-sm">
                        {getChangeLabel(diff)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!showUnchanged && unchangedRows.length > 0 && (
        <p className="text-sm text-neutral-500">
          {unchangedRows.length} unchanged tools are collapsed by default.
        </p>
      )}
    </div>
  );
}