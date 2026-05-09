import type { AuditReport } from "@/types";

import ToolCard from "@/components/ToolCard";
import ShareButton from "@/components/ShareButton";
import LeadCapture from "@/components/LeadCapture";

interface AuditResultsProps {
    report: AuditReport;
}

export default function AuditResults({
    report,
}: AuditResultsProps) {
    const isEfficient =
        report.totalMonthlySavings < 100;

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
                <div className="space-y-12">
                    <section className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-8 shadow-sm lg:p-12">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="mb-4 inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
                                    AI Spend Audit Report
                                </div>

                                <h1 className="text-5xl font-semibold tracking-tight text-balance lg:text-6xl">
                                    You could save{" "}
                                    <span className="text-green-600">
                                        $
                                        {report.totalMonthlySavings.toLocaleString()}
                                        /month
                                    </span>{" "}
                                    — $
                                    {report.totalAnnualSavings.toLocaleString()}
                                    /year
                                </h1>

                                <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
                                    We analyzed your current AI
                                    tooling stack for oversized
                                    plans, overlapping products,
                                    and opportunities to reduce
                                    spend without slowing down
                                    your team.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <ShareButton slug={report.slug} />

                                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="text-sm text-neutral-500">
                                        Potential annual impact
                                    </div>

                                    <div className="mt-2 text-3xl font-semibold tracking-tight">
                                        $
                                        {report.totalAnnualSavings.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border-l-4 border-black bg-neutral-50 p-6">
                        <p className="text-lg leading-8 text-neutral-700">
                            “{report.aiSummary}”
                        </p>
                    </section>

                    {isEfficient && (
                        <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
                            <h2 className="text-xl font-semibold text-green-900">
                                You&apos;re spending well — your AI
                                stack is already efficient.
                            </h2>

                            <p className="mt-2 max-w-3xl text-sm leading-7 text-green-800">
                                Based on the tools and plans
                                you submitted, we found limited
                                unnecessary spend. Your current
                                stack appears reasonably aligned
                                with your team size and workflow
                                needs.
                            </p>
                        </section>
                    )}

                    <section className="space-y-5">
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight">
                                Recommendations by tool
                            </h2>

                            <p className="mt-2 text-neutral-600">
                                Prioritized by measurable cost
                                savings and operational fit.
                            </p>
                        </div>

                        <div className="grid gap-5">
                            {report.results.map((result) => {
                                const matchingInput =
                                    report.inputs.find(
                                        (input) =>
                                            input.toolId ===
                                            result.toolId
                                    );

                                return (
                                    <ToolCard
                                        key={result.toolId}
                                        result={result}
                                        planId={
                                            matchingInput?.planId ??
                                            ""
                                        }
                                    />
                                );
                            })}
                        </div>
                    </section>

                    {report.showCredexCta && (
                        <section className="overflow-hidden rounded-3xl border border-neutral-900 bg-neutral-900 p-8 text-white lg:p-10">
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-2xl">
                                    <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-neutral-200">
                                        High-impact optimization
                                        opportunity detected
                                    </div>

                                    <h2 className="text-4xl font-semibold tracking-tight">
                                        Capture more savings with
                                        Credex
                                    </h2>

                                    <p className="mt-4 text-lg leading-8 text-neutral-300">
                                        Teams spending heavily on
                                        AI tools often accumulate
                                        duplicate subscriptions,
                                        fragmented procurement, and
                                        unused enterprise features.
                                        Credex helps consolidate and
                                        optimize that spend across
                                        the organization.
                                    </p>
                                </div>

                                <div>
                                    <a
                                        href="#contact"
                                        className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-neutral-200"
                                    >
                                        Talk to Credex
                                    </a>
                                </div>
                            </div>
                        </section>
                    )}

                    <section
                        id="contact"
                        className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8"
                    >
                        <div className="mb-6 max-w-2xl">
                            <h2 className="text-3xl font-semibold tracking-tight">
                                Get the full breakdown
                            </h2>

                            <p className="mt-3 text-neutral-600">
                                Save your report, share it with
                                your team, and receive future
                                optimization insights as AI
                                pricing changes.
                            </p>
                        </div>

                        <LeadCapture
                            auditSlug={report.slug}
                            teamSize={report.inputs.reduce((max, i) => Math.max(max, i.seats), 1)}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}