"use client";

import { useState } from "react";
import { useUpora } from "@/lib/store/useUporaStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ExternalLink,
  Globe,
  Clock,
  Building,
  CheckCircle2,
  Info,
} from "lucide-react";

export default function OpportunitiesPage() {
  const { opportunities } = useUpora();
  const [filterType, setFilterType] = useState("ALL");
  const [selectedOpp, setSelectedOpp] = useState<(typeof opportunities)[0] | null>(null);

  const filtered = opportunities.filter((opp) => {
    if (filterType === "ALL") return true;
    if (filterType === "VERIFIED") return opp.trustStatus === "VERIFIED";
    if (filterType === "NEEDS_REVIEW") return opp.trustStatus === "NEEDS_REVIEW";
    if (filterType === "APPRENTICESHIP") return opp.type === "APPRENTICESHIP";
    if (filterType === "FELLOWSHIP") return opp.type === "FELLOWSHIP";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <ShieldCheck className="h-4 w-4" />
          <span>Opportunity Engine & Trust Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Global Opportunities. Scanned for Authenticity.
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          Job scams and fraudulent training programs extract millions from ambitious learners. Every listing in UPORA undergoes domain authenticity and term verification before classification.
        </p>
      </div>

      {/* Trust Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-800/40 bg-emerald-950/20 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-brand-growth shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-emerald-400">VERIFIED</span>
            <p className="text-emerald-200/80">
              Corporate domain confirmed, verified recruiter or direct portal, no upfront fees.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-800/40 bg-amber-950/20 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-amber-400">NEEDS REVIEW</span>
            <p className="text-amber-200/80">
              Recently registered domain or third-party recruiter. Exercise standard caution.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-800/40 bg-rose-950/20 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-brand-risk shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-rose-400">POTENTIAL RISK</span>
            <p className="text-rose-200/80">
              Flagged for suspicious fee requests, spoofed domains, or unrealistic promises.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        tabs={[
          { id: "ALL", label: "All Listings", count: opportunities.length },
          {
            id: "VERIFIED",
            label: "Verified Only",
            count: opportunities.filter((o) => o.trustStatus === "VERIFIED").length,
          },
          {
            id: "APPRENTICESHIP",
            label: "Apprenticeships",
            count: opportunities.filter((o) => o.type === "APPRENTICESHIP").length,
          },
          {
            id: "FELLOWSHIP",
            label: "Fellowships & Grants",
            count: opportunities.filter((o) => o.type === "FELLOWSHIP").length,
          },
        ]}
        activeTab={filterType}
        onChange={setFilterType}
      />

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((opp) => (
          <Card
            key={opp.id}
            className={`flex flex-col justify-between transition-all ${
              opp.trustStatus === "POTENTIAL_RISK"
                ? "border-rose-900/60 bg-rose-950/10"
                : "border-border-subtle hover:border-border-subtle"
            }`}
          >
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    opp.trustStatus === "VERIFIED"
                      ? "growth"
                      : opp.trustStatus === "NEEDS_REVIEW"
                      ? "warning"
                      : "risk"
                  }
                >
                  {opp.trustStatus} · {opp.trustScore}/100
                </Badge>
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Deadline: {opp.deadline}</span>
                </div>
              </div>

              <div>
                <CardTitle className="text-lg font-bold text-text-primary leading-snug">
                  {opp.title}
                </CardTitle>
                <CardDescription className="text-xs mt-1 flex items-center gap-2">
                  <Building className="h-3.5 w-3.5" />
                  <span>{opp.organization}</span>
                  <span>·</span>
                  <span className="font-mono">{opp.domain}</span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-lg bg-surface-subtle px-2.5 py-1 text-text-primary font-medium">
                  {opp.type}
                </div>
                <div className="rounded-lg bg-surface-subtle px-2.5 py-1 text-text-secondary">
                  {opp.remoteStatus} ({opp.location})
                </div>
                <div className="rounded-lg bg-surface-subtle px-2.5 py-1 text-brand-growth font-mono font-medium">
                  {opp.compensation}
                </div>
              </div>

              {/* Trust Rationale Box */}
              <div
                className={`p-3 rounded-lg border text-xs leading-relaxed space-y-1 ${
                  opp.trustStatus === "VERIFIED"
                    ? "border-emerald-800/40 bg-emerald-950/20 text-emerald-300"
                    : opp.trustStatus === "NEEDS_REVIEW"
                    ? "border-amber-800/40 bg-amber-950/20 text-amber-300"
                    : "border-rose-800/40 bg-rose-950/20 text-rose-300"
                }`}
              >
                <div className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  <span>Verification Telemetry</span>
                </div>
                <p>{opp.trustRationale}</p>
              </div>
            </CardContent>

            <CardFooter className="pt-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">
                Source: {opp.source}
              </span>

              {opp.trustStatus === "POTENTIAL_RISK" ? (
                <Button size="sm" variant="danger" disabled>
                  Direct Application Blocked
                </Button>
              ) : (
                <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="primary">
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
