/**
 * UPORA Workplace State Machine
 * Pure, testable transition rules for applications, contracts and milestones.
 * Database persistence is performed by the API layer AFTER these rules pass.
 */

export const APPLICATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const CONTRACT_STATUSES = [
  "AWAITING_ESCROW",
  "ACTIVE",
  "IN_REVISION",
  "COMPLETED",
  "DISPUTED",
  "REFUNDED",
] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const MILESTONE_STATUSES = [
  "PENDING_ESCROW",
  "ESCROWED",
  "SUBMITTED",
  "APPROVED",
  "PAID_OUT",
] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

const CONTRACT_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  AWAITING_ESCROW: ["ACTIVE", "COMPLETED", "DISPUTED", "REFUNDED"],
  ACTIVE: ["IN_REVISION", "COMPLETED", "DISPUTED", "REFUNDED"],
  IN_REVISION: ["ACTIVE", "COMPLETED", "DISPUTED"],
  COMPLETED: [],
  DISPUTED: ["COMPLETED", "REFUNDED"],
  REFUNDED: [],
};

const MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  PENDING_ESCROW: ["ESCROWED"],
  ESCROWED: ["SUBMITTED"],
  SUBMITTED: ["APPROVED"],
  APPROVED: ["PAID_OUT"],
  PAID_OUT: [],
};

export function canTransitionApplication(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  return APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionContract(from: ContractStatus, to: ContractStatus): boolean {
  return CONTRACT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionMilestone(from: MilestoneStatus, to: MilestoneStatus): boolean {
  return MILESTONE_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Splits a contract total across N milestones deterministically (integer cents),
 * with the final milestone absorbing any rounding remainder.
 */
export function splitMilestoneAmounts(
  totalAmount: number,
  milestoneCount: number
): number[] {
  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    throw new Error("Total amount must be a non-negative finite number.");
  }
  const count = Math.max(1, Math.floor(milestoneCount || 1));
  const totalCents = Math.round(totalAmount * 100);
  const base = Math.floor(totalCents / count);
  const amountsInCents = Array.from({ length: count }, () => base);
  let remainder = totalCents - base * count;
  let i = 0;
  while (remainder > 0 && i < count) {
    amountsInCents[i] += 1;
    remainder -= 1;
    i += 1;
  }
  return amountsInCents.map((cents) => cents / 100);
}

export function computePlatformFee(amount: number, feePercent: number): number {
  return Math.round(amount * (feePercent / 100) * 100) / 100;
}

/**
 * Computes the payout that flows to the talent after the platform fee
 * is netted from a single payment. Returns fee and net amounts.
 */
export function computePayoutBreakdown(amount: number, feePercent: number): {
  gross: number;
  platformFee: number;
  net: number;
} {
  const platformFee = computePlatformFee(amount, feePercent);
  return {
    gross: Math.round(amount * 100) / 100,
    platformFee,
    net: Math.round((amount - platformFee) * 100) / 100,
  };
}

/** Simple default milestone titles for a contract. */
export function buildDefaultMilestones(totalAmount: number, count: number): {
  title: string;
  amount: number;
}[] {
  const amounts = splitMilestoneAmounts(totalAmount, count);
  return amounts.map((amount, index) => ({
    title:
      count === 1
        ? "Single milestone: full scoped delivery"
        : `Milestone ${index + 1} of ${count}: scoped deliverable`,
    amount,
  }));
}

export function describeApplicationTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): string {
  if (from === to) return `Already ${to.toLowerCase()}.`;
  if (!canTransitionApplication(from, to)) {
    return `Status change from ${from} to ${to} is not allowed.`;
  }
  return `Application moved from ${from} to ${to}.`;
}