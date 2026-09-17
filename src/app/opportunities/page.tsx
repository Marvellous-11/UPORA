"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, ExternalLink, Clock, MapPin, Search } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  organizationName: string;
  organizationDomain: string;
  type: string;
  location: string;
  isRemoteEligible: boolean;
  salaryOrStipendUSD: string | null;
  applicationUrl: string;
  deadline: string | null;
  trustStatus: "VERIFIED" | "NEEDS_REVIEW" | "POTENTIAL_RISK";
  trustScore: number;
  trustRationale: string | null;
  rawSource: string;
}

const TRUST_CONFIG = {
  VERIFIED: { variant: "growth" as const, label: "Verified", icon: ShieldCheck },
  NEEDS_REVIEW: { variant: "warning" as const, label: "Needs Review", icon: AlertCircle },
  POTENTIAL_RISK: { variant: "risk" as const, label: "Potential Risk", icon: AlertCircle },
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => setOpportunities(data.opportunities || []))
      .catch(() => setError("Unable to load opportunities right now."))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL"
      ? opportunities
      : opportunities.filter((o) => o.trustStatus === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <Search className="h-4 w-4" />
          <span>Opportunity Authenticity Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          External Opportunities
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          Every listing is scanned for domain authenticity and fraud signals. Trust status is assigned
          transparently — UPORA does not endorse any external organization.
        </p>
      </div>

      {/* Trust Legend */}
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-text-primary font-semibold">VERIFIED</span>
          <span className="text-text-secondary">— Confirmed legitimate organization, no fee requests</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-text-primary font-semibold">NEEDS REVIEW</span>
          <span className="text-text-secondary">— Proceed with caution; verify independently</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
          <span className="text-text-primary font-semibold">POTENTIAL RISK</span>
          <span className="text-text-secondary">— Suspicious signals detected; do not submit personal data</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "VERIFIED", "NEEDS_REVIEW", "POTENTIAL_RISK"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? "border-brand-growth bg-brand-growth/10 text-brand-growth font-semibold"
                : "border-border-subtle text-text-secondary hover:border-brand-growth/40"
            }`}
          >
            {f === "ALL" ? "All" : f.replace("_", " ")}
            {f !== "ALL" && (
              <span className="ml-1.5 font-mono">
                ({opportunities.filter((o) => o.trustStatus === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-text-secondary">Loading opportunities…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-text-primary">No opportunities found</p>
          <p className="text-xs text-text-secondary">
            {filter !== "ALL"
              ? `No ${filter.replace("_", " ").toLowerCase()} listings in the database.`
              : "Run the seed script to load starter opportunities: npm run db:seed"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((opp) => {
            const trust = TRUST_CONFIG[opp.trustStatus];
            const TrustIcon = trust.icon;
            const isRisky = opp.trustStatus === "POTENTIAL_RISK";

            return (
              <Card
                key={opp.id}
                className={`border-border-subtle bg-surface transition-all ${
                  isRisky ? "opacity-75 border-rose-800/40" : "hover:border-brand-growth/40"
                }`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h4 className="font-bold text-text-primary text-sm leading-snug">{opp.title}</h4>
                      <div className="text-[11px] text-text-secondary">
                        {opp.organizationName} · {opp.organizationDomain}
                      </div>
                    </div>
                    <Badge variant={trust.variant} className="text-[10px] shrink-0 flex items-center gap-1">
                      <TrustIcon className="h-3 w-3" />
                      {trust.label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {opp.location}
                      {opp.isRemoteEligible && " · Remote eligible"}
                    </span>
                    {opp.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Deadline: {new Date(opp.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-text-secondary uppercase tracking-wider">Type</div>
                      <div className="text-xs font-medium text-text-primary">{opp.type}</div>
                    </div>
                    {opp.salaryOrStipendUSD && (
                      <div className="text-right space-y-0.5">
                        <div className="text-[10px] text-text-secondary uppercase tracking-wider">Compensation</div>
                        <div className="text-xs font-mono font-bold text-brand-growth">{opp.salaryOrStipendUSD}</div>
                      </div>
                    )}
                  </div>

                  {/* Trust Rationale */}
                  {opp.trustRationale && (
                    <div
                      className={`rounded-lg p-2.5 text-[11px] border ${
                        isRisky
                          ? "border-rose-800/40 bg-rose-950/20 text-rose-300"
                          : opp.trustStatus === "NEEDS_REVIEW"
                          ? "border-amber-800/40 bg-amber-950/20 text-amber-200/90"
                          : "border-emerald-800/40 bg-emerald-950/20 text-emerald-300"
                      }`}
                    >
                      {opp.trustRationale}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between">
                    <span className="text-[10px] text-text-secondary">Source: {opp.rawSource}</span>
                    {isRisky ? (
                      <span className="text-[11px] text-rose-400 font-semibold">Do not apply</span>
                    ) : (
                      <a
                        href={opp.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-brand-growth hover:underline flex items-center gap-1 font-semibold"
                      >
                        Apply <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
