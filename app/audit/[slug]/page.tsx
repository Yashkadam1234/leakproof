import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AuditResults from "@/components/AuditResults";

import { supabase } from "@/lib/supabase";

import type { AuditReport } from "@/types";

type AuditPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

interface AuditRow {
    slug: string;
    report_json: unknown;
    created_at: string;
}

function sanitizeReport(
    report: AuditReport
): AuditReport {
    /**
     * Defensive privacy stripping.
     *
     * AuditReport currently does not include
     * email/companyName, but this protects
     * against future accidental additions.
     */
    const {
        email: _email,
        companyName: _companyName,
        ...safeReport
    } = report as AuditReport & {
        email?: string;
        companyName?: string;
    };

    return safeReport;
}

async function getAuditBySlug(
    slug: string
): Promise<AuditReport | null> {
    const { data, error } = await supabase
        .from("audits")
        .select("*")
        .eq("slug", slug)
        .single<AuditRow>();

    if (error || !data) {
        return null;
    }

    const parsedReport =
        data.report_json as AuditReport;

    return sanitizeReport(parsedReport);
}

export async function generateMetadata({
    params,
}: AuditPageProps): Promise<Metadata> {
    const { slug } = await params;
    const report = await getAuditBySlug(slug);
    if (!report) {
        return {
            title: "Audit not found",
        };
    }

    const monthlySavings =
        report.totalMonthlySavings.toLocaleString();

    const description =
        report.aiSummary.length > 120
            ? `${report.aiSummary.slice(
                0,
                120
            )}...`
            : report.aiSummary;

    const title = `This team could save $${monthlySavings}/month on AI tools`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function AuditPage({
    params,
}: AuditPageProps) {
    const { slug } = await params;
    const report = await getAuditBySlug(slug);

    if (!report) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <AuditResults report={report} />
            </div>
        </main>
    );
}