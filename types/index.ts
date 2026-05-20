export type BillingType =
  | "per_seat"
  | "flat"
  | "usage_based";

export type UseCase =
  | "coding"
  | "writing"
  | "data"
  | "research"
  | "mixed";

export type AuditStatus =
  | "overspending"
  | "suboptimal"
  | "optimal";

export interface Plan {
  id: string;
  name: string;
  pricePerSeat: number;
  billingType: BillingType;
}

export interface Tool {
  id: string;
  name: string;
  plansAvailable: Plan[];
}

export interface AuditInput {
  toolId: string;
  planId: string;
  monthlySpend: number;
  seats: number;
  useCase: UseCase;
}

export interface AuditFormState {
  list: AuditInput[];
  teamSize: number;
  submittedAt: string;
}

export interface AuditResult {
  toolId: string;
  currentMonthlyCost: number;
  recommendedAction: string;
  estimatedSavings: number;
  reason: string;
  status: AuditStatus;
}

/**
 * Round 2 pricing snapshot.
 *
 * Stores the exact vendor pricing used
 * when the audit was generated.
 */
export interface PricingSnapshot {
  version: string;

  tools: Record<
    string,
    {
      plans: Record<
        string,
        {
          name: string;
          pricePerSeat: number;
        }
      >;
    }
  >;
}

export interface AuditReport {
  slug: string;
  inputs: AuditInput[];
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string;
  createdAt: string;
  showCredexCta: boolean;

  /**
   * Optional to preserve Round 1 compatibility.
   */
  pricingSnapshot?: PricingSnapshot;
}

export interface Lead {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditSlug: string;
  capturedAt: string;
}