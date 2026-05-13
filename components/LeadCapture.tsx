"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadCaptureProps {
  auditSlug: string;
  teamSize: number;
}

interface LeadFormState {
  email: string;
  companyName: string;
  role: string;
  teamSize: number;
  website: string;
}

export default function LeadCapture({
  auditSlug,
  teamSize,
}: LeadCaptureProps) {
  const [form, setForm] =
    useState<LeadFormState>({
      email: "",
      companyName: "",
      role: "",
      teamSize,
      website: "",
    });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  function updateField(
    field: keyof LeadFormState,
    value: string | number
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    /**
     * Basic client validation.
     */
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/leads",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            companyName:
              form.companyName || undefined,
            role:
              form.role || undefined,
            teamSize: form.teamSize,
            auditSlug,
            website: form.website,
          }),
        }
      );

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to save report."
        );
      }

      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Success state shown after
   * lead capture completes.
   */
  if (success) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-green-900">
          Report saved — check your inbox
        </h3>

        <p className="mt-2 text-sm leading-7 text-green-700">
          We saved your audit details and
          future optimization updates can be
          sent as AI pricing changes.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-semibold tracking-tight">
          Save your audit report
        </h3>

        <p className="mt-2 text-neutral-600">
          Get a copy of your results and stay
          updated as AI pricing and plans
          change.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">
              Work email
            </Label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={form.email}
              onChange={(e) =>
                updateField(
                  "email",
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company name
            </Label>

            <Input
              id="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Acme Inc."
              value={form.companyName}
              onChange={(e) =>
                updateField(
                  "companyName",
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role
            </Label>

            <Input
              id="role"
              type="text"
              autoComplete="organization-title"
              placeholder="CTO, Engineer, Ops..."
              value={form.role}
              onChange={(e) =>
                updateField(
                  "role",
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize">
              Team size
            </Label>

            <Input
              id="teamSize"
              type="number"
              min={1}
              value={form.teamSize}
              onChange={(e) =>
                updateField(
                  "teamSize",
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </div>
        </div>

        {/* Honeypot field for bots */}
        <div className="hidden">
          <Label htmlFor="website">
            Website
          </Label>

          <Input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) =>
              updateField(
                "website",
                e.target.value
              )
            }
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm text-neutral-500">
            No spam. We’ll only send your
            report and occasional pricing
            updates relevant to AI tooling.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6"
          >
            {isSubmitting
              ? "Saving report..."
              : "Save report"}
          </Button>
        </div>
      </form>
    </div>
  );
}