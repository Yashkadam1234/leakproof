"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AuditForm from "@/components/AuditForm";

import type { AuditInput } from "@/types";

export default function HomePage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  async function handleAuditSubmit(
    inputs: AuditInput[],
    teamSize: number
  ) {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          inputs,
          teamSize,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to generate audit report."
        );
      }

      const data = (await response.json()) as {
        slug: string;
      };

      router.push(`/audit/${data.slug}`);
    } catch (err) {
      console.error(err);

      setError(
        "We couldn't generate your audit right now. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="border-b border-neutral-200">
<div className="mx-auto flex max-w-7xl flex-col px-6 pt-6 pb-14 lg:flex-row lg:items-center lg:justify-between lg:px-8">   <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
            <div className="mb-6 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-600">
              AI tooling costs are compounding
              faster than most teams realize.
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              Find the AI subscriptions your
              company is quietly overpaying
              for.
            </h1>

            <p className="mt-3 max-w-2xl text-lg leading-8 text-neutral-600">
              Most engineering teams now pay
              for overlapping copilots, unused
              enterprise plans, and AI seats
              that no longer match how people
              actually work. This audit shows
              where the waste is — and what to
              replace, downgrade, or consolidate.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#audit-form"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Run a free AI spend audit
              </a>

              <div className="text-sm text-neutral-500">
                No login required · Takes ~2
                minutes
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <div>
                <div className="text-2xl font-semibold">
                  30–40%
                </div>

                <p className="mt-1 text-sm text-neutral-600">
                  Typical reduction in
                  overlapping AI spend
                </p>
              </div>

              <div>
                <div className="text-2xl font-semibold">
                  8+
                </div>

                <p className="mt-1 text-sm text-neutral-600">
                  AI vendors benchmarked
                  against each other
                </p>
              </div>

              <div>
                <div className="text-2xl font-semibold">
                  Instant
                </div>

                <p className="mt-1 text-sm text-neutral-600">
                  Recommendations based on
                  seat count and workflows
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="audit-form"
        className="mx-auto max-w-5xl px-6 py-16 lg:px-8"
      >
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Audit your current AI stack
          </h2>

          <p className="mt-3 text-neutral-600">
            Add the tools your team&apos;s currently
            pays for and we&apos;ll identify
            oversized plans, cheaper
            alternatives, and consolidation
            opportunities.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div
          className={`transition-opacity ${
            isSubmitting
              ? "pointer-events-none opacity-60"
              : "opacity-100"
          }`}
        >
          <AuditForm
            onSubmit={handleAuditSubmit}
          />
        </div>

        {isSubmitting && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

            Generating your audit report and
            benchmarking your stack against
            current market pricing...
          </div>
        )}
      </section>
    </main>
  );
}