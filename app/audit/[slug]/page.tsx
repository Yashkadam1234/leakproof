export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";

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
  report_json: AuditReport;
  created_at: string;
}

/**
 * Remove sensitive fields before
 * exposing report publicly.
 */
function sanitizeReport(report: AuditReport): AuditReport {
  const safeReport = { ...report };
  delete (safeReport as Record<string, unknown>)["email"];
  delete (safeReport as Record<string, unknown>)["companyName"];
  return safeReport;
}

async function getAudit(
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

  return sanitizeReport(
    data.report_json
  );
}

export async function generateMetadata({
  params,
}: AuditPageProps): Promise<Metadata> {
    const { slug } = await params;
  const report = await getAudit(slug);

  if (!report) {
    return {
      title: "Audit not found",
      description:
        "The requested AI spend audit could not be found.",
    };
  }

  const monthlySavings =
    report.totalMonthlySavings.toLocaleString();

  const title = `This team could save $${monthlySavings}/month on AI tools — Leakproof`;

  const description =
    report.aiSummary.length > 120
      ? `${report.aiSummary.slice(
          0,
          120
        )}...`
      : report.aiSummary;

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/og?slug=${slug}`,
          width: 1200,
          height: 630,
          alt: "Leakproof AI Spend Audit",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `/api/og?slug=${slug}`,
      ],
    },
  };
}

export default async function AuditPage({
  params,
}: AuditPageProps) {
 const { slug } = await params;
  const report = await getAudit(slug);

  /**
   * Friendly public 404 state.
   */
  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-lg text-center">
          <div className="mb-5 inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-600">
            Audit unavailable
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
            We couldn&apos;t find this audit
          </h1>

          <p className="mt-4 text-lg leading-8 text-neutral-600">
            The report may have expired,
            been removed, or the link may
            be incorrect.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Run a new audit
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AuditResults report={report} />
      </div>
    </main>
  );
}