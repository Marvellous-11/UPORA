/**
 * UPORA Internal Wallet Ledger
 *
 * Pure ledger math used to move internal balances when milestone work is
 * approved. Payments are NOT routed to a real gateway; the ledger marks the
 * transaction as settled "INTERNAL_LEDGER" until a real payment adapter is
 * configured (see P2.1 in UPORA_MVP_ROADMAP.md).
 */

export interface WalletSnapshot {
  availableBalance: number;
  pendingEscrowBalance: number;
  lifetimeEarnings: number;
}

export interface LedgerEntry {
  amount: number;
  currency: string;
  type: "ESCROW_DEPOSIT" | "ESCROW_RELEASE" | "PAYOUT_WITHDRAWAL" | "PLATFORM_FEE" | "DISPUTE_REFUND";
  status: "INITIATED" | "PROCESSING" | "SUCCESSFUL" | "FAILED";
  paymentGateway: string;
  gatewayTransactionRef: string | null;
  idempotencyKey: string;
  metadata: Record<string, unknown> | null;
}

/** Applies a milestone release to the talent wallet. */
export function applyMilestoneRelease(
  wallet: WalletSnapshot,
  amount: number,
  currency: string
): { balances: WalletSnapshot; entry: LedgerEntry } {
  const normalized = Math.round(amount * 100) / 100;
  if (normalized < 0) throw new Error("Milestone release amount cannot be negative.");

  const balances: WalletSnapshot = {
    availableBalance: Math.round((wallet.availableBalance + normalized) * 100) / 100,
    pendingEscrowBalance: wallet.pendingEscrowBalance,
    lifetimeEarnings: Math.round((wallet.lifetimeEarnings + normalized) * 100) / 100,
  };

  const entry: LedgerEntry = {
    amount: normalized,
    currency,
    type: "ESCROW_RELEASE",
    status: "SUCCESSFUL",
    paymentGateway: "INTERNAL_LEDGER",
    gatewayTransactionRef: `int-${buildIdempotencyKey()}`,
    idempotencyKey: buildIdempotencyKey(),
    metadata: { settlement: "internal_ledger_mvp", note: "Awaiting live payment gateway integration" },
  };

  return { balances, entry };
}

/** Applies a platform fee charge (recorded against the client wallet, MVP-only). */
export function buildPlatformFeeEntry(
  amount: number,
  currency: string,
  contractId: string
): LedgerEntry {
  return {
    amount: Math.round(amount * 100) / 100,
    currency,
    type: "PLATFORM_FEE",
    status: "SUCCESSFUL",
    paymentGateway: "INTERNAL_LEDGER",
    gatewayTransactionRef: `fee-${contractId.slice(0, 8)}-${Date.now()}`,
    idempotencyKey: `fee-${contractId}-${buildIdempotencyKey()}`,
    metadata: { contractId },
  };
}

/** Deterministic-enough unique key for ledger idempotency. */
export function buildIdempotencyKey(): string {
  const rand = Math.random().toString(36).slice(2, 12);
  return `${Date.now().toString(36)}-${rand}`;
}

/** Formats a persisted Decimal as a plain JS number safely. */
export function decimalToNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}