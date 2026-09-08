"use client";

import { useState } from "react";
import { useUpora } from "@/lib/store/useUporaStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
  Lock,
  Globe,
  Star,
  Copy,
  Check,
  Hash,
} from "lucide-react";

export default function SkillPassportPage() {
  const { profile, skills } = useUpora();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyPassportLink = () => {
    navigator.clipboard.writeText(`https://upora.org/passport/${profile.passportId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-growth/15 text-brand-growth font-black text-2xl border border-brand-growth/30 shadow-inner">
              ME
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {profile.fullName}
                </h1>
                <Badge variant="growth" className="text-[11px]">
                  Verified Talent
                </Badge>
                <Badge variant="neutral" className="text-[10px] font-mono">
                  {profile.passportId}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary">{profile.headline}</p>
              <div className="flex items-center gap-3 text-xs text-text-secondary pt-0.5">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {profile.country}
                </span>
                <span>·</span>
                <span>{profile.timezone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <Button variant="outline" size="sm" onClick={handleCopyPassportLink}>
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1 text-brand-growth" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  <span>Share Verified Passport</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Core Verification Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border-subtle">
          <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle">
            <div className="text-[11px] text-text-secondary font-medium uppercase">Reputation</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-lg text-text-primary">
              <ShieldCheck className="h-4 w-4 text-brand-growth" />
              <span>{profile.reputationScore.toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle">
            <div className="text-[11px] text-text-secondary font-medium uppercase">Verified Badges</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-lg text-text-primary">
              <Award className="h-4 w-4 text-blue-400" />
              <span>{skills.length}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle">
            <div className="text-[11px] text-text-secondary font-medium uppercase">Completed Contracts</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-lg text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-brand-growth" />
              <span>{profile.completedTasksCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle">
            <div className="text-[11px] text-text-secondary font-medium uppercase">Dispute Rate</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-lg text-text-primary font-mono">
              0.0%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Verified Skills & Cryptographic Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    Verified Competencies & Practical Evidence
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Every badge represents an audited technical artifact or client milestone.
                  </CardDescription>
                </div>
                <Badge variant="growth">{skills.length} Badges</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/50 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary">{skill.name}</h3>
                        <Badge
                          variant={skill.tier === "PROJECT_VERIFIED" ? "growth" : "focus"}
                          className="text-[10px]"
                        >
                          {skill.tier.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        Category: {skill.category} · Verified on {skill.verifiedAt}
                      </div>
                    </div>

                    {skill.score && (
                      <div className="self-start sm:self-center font-mono font-bold text-sm text-brand-growth">
                        Score: {skill.score}/100
                      </div>
                    )}
                  </div>

                  {skill.evidenceTitle && (
                    <div className="text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border-subtle/60 space-y-1">
                      <div className="font-medium text-text-primary">Evaluated Artifact:</div>
                      <p>{skill.evidenceTitle}</p>
                      {skill.evidenceHash && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-text-secondary/80 pt-1">
                          <Hash className="h-3 w-3 text-brand-growth shrink-0" />
                          <span className="truncate">{skill.evidenceHash}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Client Reviews & 360 Feedback */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Client Validations & Reviews</CardTitle>
              <CardDescription className="text-xs">
                Feedback attached to completed, funded marketplace contracts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                    <span className="ml-1 text-xs font-bold text-text-primary">5.0</span>
                  </div>
                  <span className="text-[11px] text-text-secondary">September 3, 2026</span>
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                  "Marvellous parsed our log files with precision, flagged two zero-day anomalies, and delivered 4 hours before deadline. Exceptional communicator. Will re-hire for upcoming infrastructure hardening."
                </p>
                <div className="text-xs text-text-secondary pt-1 border-t border-border-subtle/40 flex justify-between">
                  <span>Contract: Log Ingestion Script</span>
                  <span className="font-semibold text-text-primary">Lead DevOps · CloudOps Global</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                    <span className="ml-1 text-xs font-bold text-text-primary">5.0</span>
                  </div>
                  <span className="text-[11px] text-text-secondary">August 29, 2026</span>
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                  "Normalized multi-store sales schemas cleanly and documented migration scripts. Clean SQL syntax and prompt delivery."
                </p>
                <div className="text-xs text-text-secondary pt-1 border-t border-border-subtle/40 flex justify-between">
                  <span>Contract: Merchant Sales Normalization</span>
                  <span className="font-semibold text-text-primary">Data Lead · Apex Data Labs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Transparent Reputation Factor Breakdown */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Reputation Integrity Factors</CardTitle>
              <CardDescription className="text-xs">
                No opaque black-box AI scores. Calculated from verifiable delivery factors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-subtle border border-border-subtle">
                <span className="text-text-secondary">On-Time Milestone Delivery</span>
                <span className="font-mono font-bold text-brand-growth">100% (4/4)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-subtle border border-border-subtle">
                <span className="text-text-secondary">Practical Rubric Average</span>
                <span className="font-mono font-bold text-text-primary">91.2/100</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-subtle border border-border-subtle">
                <span className="text-text-secondary">Client Rating Average</span>
                <span className="font-mono font-bold text-amber-400">5.0 ★</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-surface-subtle border border-border-subtle">
                <span className="text-text-secondary">Revision Request Rate</span>
                <span className="font-mono font-bold text-text-primary">0.0%</span>
              </div>

              <div className="pt-3 border-t border-border-subtle text-text-secondary leading-relaxed text-[11px]">
                UPORA allows talent to file disputes against inaccurate client ratings or unfair assessment deductions with guaranteed human review.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
