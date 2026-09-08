"use client";

import { useState } from "react";
import { useUpora } from "@/lib/store/useUporaStore";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CreditCard,
  PlusCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Lock,
} from "lucide-react";

export default function FinancialProgressPage() {
  const { financials, logFinancialSaving } = useUpora();
  const [saveAmount, setSaveAmount] = useState("25");

  const savingsPercent = Math.min(
    100,
    Math.round(
      (financials.currentGoalSavedUSD / financials.currentGoalTargetUSD) * 100
    )
  );

  const handleAddSaving = () => {
    const num = parseFloat(saveAmount);
    if (!isNaN(num) && num > 0) {
      logFinancialSaving(num);
      setSaveAmount("25");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <TrendingUp className="h-4 w-4" />
          <span>Financial Progress & Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Turn Practical Work into Economic Mobility
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          UPORA tracks your verified marketplace earnings and personal savings progress. We do not act as a custodial bank; all escrow and withdrawals are settled via licensed global processors.
        </p>
      </div>

      {/* Core Financial Metrics (Founder's Mandated Format) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-2">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Income This Month
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-text-primary">
            {formatCurrency(financials.incomeThisMonth)}
          </div>
          <div className="text-[11px] text-brand-growth font-medium flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            <span>+100% from last month</span>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-2">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Saved This Month
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-brand-growth">
            {formatCurrency(financials.savedThisMonth)}
          </div>
          <div className="text-[11px] text-text-secondary">
            Allocated to targets
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-2">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Available Wallet Balance
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-text-primary">
            {formatCurrency(financials.availableBalanceUSD)}
          </div>
          <div className="text-[11px] text-text-secondary">
            Ready for local payout
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5 space-y-2">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Lifetime UPORA Earnings
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-text-primary">
            {formatCurrency(financials.lifetimeEarningsUSD)}
          </div>
          <div className="text-[11px] text-blue-400 font-medium">
            4 verified milestones
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Goal Progress & Transaction Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Goal Progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    Target Milestone: {financials.currentGoalTitle}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Goal Target: {formatCurrency(financials.currentGoalTargetUSD)} · Current Saved: {formatCurrency(financials.currentGoalSavedUSD)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-bold text-brand-growth">
                    {savingsPercent}%
                  </span>
                  <div className="text-[10px] text-text-secondary uppercase font-semibold">Progress</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={savingsPercent} className="h-3" />

              {/* Quick Save Simulator */}
              <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Allocate Income to this Goal:
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={saveAmount}
                    onChange={(e) => setSaveAmount(e.target.value)}
                    className="w-32 font-mono text-sm"
                    placeholder="25"
                  />
                  <Button size="sm" variant="primary" onClick={handleAddSaving}>
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    <span>Log Saving Contribution</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Double-Entry Transaction Ledger */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Transaction & Escrow History</CardTitle>
              <CardDescription className="text-xs">
                Audited record of released client milestones and withdrawals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {financials.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border-subtle bg-surface-subtle/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                        tx.type === "CREDIT"
                          ? "border-emerald-800/60 bg-emerald-950/30 text-brand-growth"
                          : "border-border-subtle bg-surface-subtle text-text-secondary"
                      }`}
                    >
                      {tx.type === "CREDIT" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-text-primary">
                        {tx.title}
                      </div>
                      <div className="text-[11px] text-text-secondary mt-0.5">
                        {tx.date} · Status: <span className="text-text-primary">{tx.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-brand-growth">
                      +{formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[10px] text-text-secondary font-mono">
                      USD
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Compliant Payment Infrastructure & Payout Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-400" />
                <CardTitle className="text-base font-bold">Payout Method</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Non-custodial global transfer adapters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Global Bank Transfer (Wise/ACH)</span>
                  <Badge variant="growth" className="text-[9px]">ACTIVE</Badge>
                </div>
                <p className="text-text-secondary text-[11px]">
                  Direct deposit via Stripe Connect & Wise Multi-Currency. Payouts clear in 1–2 business days with 0% UPORA platform withdrawal fees.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle space-y-1.5 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">African Regional Clearing (Paystack)</span>
                  <Badge variant="neutral" className="text-[9px]">AVAILABLE</Badge>
                </div>
                <p className="text-text-secondary text-[11px]">
                  Local bank clearing in NGN, KES, GHS, ZAR.
                </p>
              </div>

              <div className="pt-2 border-t border-border-subtle text-[11px] text-text-secondary leading-relaxed">
                <div className="flex items-start gap-1.5 text-text-secondary">
                  <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    UPORA does not store full card numbers or sensitive banking credentials. All transfers are protected by bank-grade TLS 1.3 encryption.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
