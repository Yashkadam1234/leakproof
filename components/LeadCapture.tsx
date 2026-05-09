// components/LeadCapture.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface LeadCaptureProps {
  auditSlug: string;
  teamSize: number;
}

export default function LeadCapture({
  auditSlug,
  teamSize,
}: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName,
          role,
          teamSize,
          auditSlug,
          website: "", // honeypot
        }),
      });

      if (!response.ok) throw new Error("Failed to save lead");

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="p-6">
          <p className="text-sm text-green-700">
            Report saved — check your inbox.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-neutral-200">
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-medium">
            Save your audit report
          </h3>
          <p className="text-sm text-muted-foreground">
            Get a copy sent to your inbox.
          </p>
        </div>

        {/* Honeypot field — hidden from humans */}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company name (optional)</Label>
          <Input
            id="company"
            type="text"
            placeholder="Acme Inc."
            value={companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCompanyName(e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Your role (optional)</Label>
          <Input
            id="role"
            type="text"
            placeholder="CTO, Engineering Manager..."
            value={role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRole(e.target.value)
            }
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!email || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Saving..." : "Save my report"}
        </Button>
      </CardContent>
    </Card>
  );
}