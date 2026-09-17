"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, ArrowRight, Clock, CheckCircle2, Info } from "lucide-react";

interface WalletData {
  id?: string;
  availableBalance: number;
  pendingEscrowBalance: number;
  lifetimeEarnings: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  paymentGateway: string;
  createdAt: string;
}

export default function FinancePage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/wallet")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load wallet"))))
      .then((data) => {
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
      })
      .catch(() => setError("Unable to load wallet data right now."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Sign in to view your finances</h1>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-text-secondary">Loading wallet…</div>;
  }

  const currency = wallet?.currency || "USD";
  const available = wallet?.availableBalance ?? 0;
  const escrow = wallet?.pendingEscrowBalance ?? 0;
  const lifetime = wallet?.lifetimeEarnings ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <TrendingUp className="h-4 w-4" />
          <span>Financial Progress Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Wallet & Earnings
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          Verified earnings from completed contract milestones. Balances reflect internal ledger settlements.
        </p>
      </div>

      {/* Simulation Disclosure */}
      <div className="rounded-xl border border-amber-800/50 bg-amber-950/20 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 space-y-1">
          <p className="font-semibold">Internal Ledger — MVP Simulation</p>
          <p>
            Payments are currently settled through UPORA&apos;s internal ledger only. No real money has been transferred.
            Live payment gateway integration (Stripe Connect, Paystack, Wise) is planned for a future release.
            Do not treat these balances as real funds until a live gateway is connected.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Available Balance</div>
            <div className="text-2xl font-black font-mono text-brand-growth">
              {formatCurrency(available, currency)}
            </div>
            <div className="text-[11px] text-text-secondary">Internal ledger — not yet withdrawable</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Pending Escrow</div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {formatCurrency(escrow, currency)}
            </div>
            <div className="text-[11px] text-text-secondary">Held until milestone approval</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-1">
            <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Lifetime Earnings</div>
            <div className="text-2xl font-black font-mono text-text-primary">
              {formatCurrency(lifetime, currency)}
            </div>
            <div className="text-[11px] text-text-secondary">Total released from completed milestones</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Transaction History</h2>
          <p className="text-xs text-text-secondary mt-1">
            All ledger entries from contract milestone settlements.
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-6 text-sm text-text-secondary space-y-2">
            <p>No transactions yet.</p>
            <p>
              Complete contract milestones on the{" "}
              <Link href="/work" className="text-brand-growth hover:underline">
                Work Marketplace
              </Link>{" "}
              to see earnings here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-xl border border-border-subtle bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-text-primary capitalize">
                    {tx.type.toLowerCase().replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    {new Date(tx.createdAt).toLocaleDateString()} · Gateway: {tx.paymentGateway}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-brand-growth text-sm">
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                  <Badge
                    variant={tx.status === "SUCCESSFUL" ? "growth" : tx.status === "FAILED" ? "risk" : "warning"}
                    className="text-[10px]"
                  >
                    {tx.status === "SUCCESSFUL" ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" />{tx.status}</>
                    ) : tx.status === "PROCESSING" ? (
                      <><Clock className="h-3 w-3 mr-1" />{tx.status}</>
                    ) : (
                      tx.status
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-text-primary">Ready to earn?</div>
          <div className="text-xs text-text-secondary mt-0.5">
            Apply to verified tasks on the marketplace to start building your balance.
          </div>
        </div>
        <Link href="/work">
          <Button variant="primary">
            Browse Open Tasks <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
