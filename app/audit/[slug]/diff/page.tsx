import Link from "next/link";
import { notFound } from "next/navigation";

import AuditDiff from "@/components/AuditDiff";

import { generateAuditReport } from "@/lib/audit-engine";
import { supabase } from "@/lib/supabase";

import type { AuditReport, PricingSnapshot, } from "@/types";

interface AuditDiffPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface AuditRow {
    slug: string;
    report_json: AuditReport;
    pricing_snapshot: PricingSnapshot | null;
}

function inferTeamSize(report: AuditReport): number {
    return Math.max(
        ...report.inputs.map((input) => input.seats),
        1
    );
}

async function getAuditBySlug(
  slug: string
): Promise<{
  report: AuditReport;
  pricingSnapshot: PricingSnapshot | null;
} | null> {
  const { data, error } = await supabase
    .from("audits")
    .select("slug, report_json, pricing_snapshot")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    console.error("Diff audit fetch failed:", error);
    return null;
  }

  const row = data as AuditRow;

  return {
    report: row.report_json,
    pricingSnapshot: row.pricing_snapshot,
  };
}

export default async function AuditDiffPage({
  params,
}: AuditDiffPageProps) {
  const { slug } = await params;

  const auditData = await getAuditBySlug(
    slug
  );

    if (!auditData) {
        notFound();
    }

    const {
        report: oldReport,
    } = auditData;
    const teamSize = inferTeamSize(oldReport);

    /**
 * Current pricing rerun.
 *
 * Old pricing snapshot is intentionally
 * fetched and preserved so the diff page
 * can compare historical assumptions
 * against current vendor pricing.
 */
    const generatedNewReport =
        generateAuditReport(
            oldReport.inputs,
            teamSize
        );

    const newReport: AuditReport = {
        ...generatedNewReport,
        slug: oldReport.slug,
    };

    const oldSavings = oldReport.totalMonthlySavings;
    const newSavings = newReport.totalMonthlySavings;
    const savingsDelta = newSavings - oldSavings;

    const deltaLabel =
        savingsDelta > 0
            ? `that is $${savingsDelta.toLocaleString()} more`
            : savingsDelta < 0
                ? `that is $${Math.abs(savingsDelta).toLocaleString()} less`
                : "no change";

    return (
        <main className="min-h-screen bg-white text-neutral-900">
            <section className="border-b border-neutral-200 bg-neutral-50">
                <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
                            Updated audit
                        </div>

                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                            Your audit has been updated
                        </h1>

                        <p className="mt-4 text-lg leading-8 text-neutral-600">
                            Pricing changed since your last audit. Here is what is different.
                        </p>
                    </div>

                    <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
                        <p className="text-sm font-medium text-neutral-500">
                            Updated savings estimate
                        </p>

                        <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                            You could now save{" "}
                            <span className="text-green-600">
                                ${newSavings.toLocaleString()}/month
                            </span>
                        </h2>

                        <p className="mt-3 text-neutral-600">
                            Was ${oldSavings.toLocaleString()} — {deltaLabel}.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Run new audit
                        </Link>

                        <Link
                            href={`/audit/${oldReport.slug}`}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                        >
                            View original audit
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
                <AuditDiff oldReport={oldReport} newReport={newReport} />
            </section>
        </main>
    );
}