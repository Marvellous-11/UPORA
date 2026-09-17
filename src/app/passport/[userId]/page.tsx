"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Star,
  ExternalLink,
} from "lucide-react";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function PublicPassportPage({ params }: PageProps) {
  const { userId } = use(params);
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/passport/${userId}`)
      .then((r) => {
        if (r.status === 404) throw new Error("This passport is private or does not exist.");
        if (!r.ok) throw new Error("Failed to load passport.");
        return r.json();
      })
      .then((data) => setPassport(data.passport))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-text-secondary">
        Loading Skill Passport…
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="p-4 rounded-xl border border-rose-800/60 bg-rose-950/30 text-rose-300 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error || "Passport not found."}</span>
        </div>
        <Link href="/" className="text-brand-growth hover:underline text-xs">
          ← Back to UPORA
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* UPORA Attribution */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary">
          <div className="h-6 w-6 rounded bg-brand-growth text-canvas-dark font-black text-sm flex items-center justify-center">
            U
          </div>
          <span className="font-semibold">UPORA Verified Skill Passport</span>
        </Link>
        <Badge variant="growth" className="text-[10px]">
          <ShieldCheck className="h-3 w-3 mr-1" /> Cryptographically Auditable
        </Badge>
      </div>

      {/* Identity */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {passport.fullName}
            </h1>
            {passport.headline && (
              <p className="text-sm text-text-secondary">{passport.headline}</p>
            )}
            {passport.countryCode && (
              <p className="text-xs text-text-secondary">{passport.countryCode}</p>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <div className="text-[11px] text-text-secondary uppercase tracking-wider">Reputation Score</div>
            <div className="text-2xl font-black text-brand-growth">
              {Number(passport.reputationScore).toFixed(1)}
            </div>
          </div>
        </div>

        {passport.bio && (
          <p className="text-sm text-text-secondary leading-relaxed border-t border-border-subtle pt-4">
            {passport.bio}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 border-t border-border-subtle pt-4">
          <div className="text-center">
            <div className="text-xl font-black text-text-primary">{passport.verifiedSkillsCount}</div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">Verified Skills</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-text-primary">{passport.completedProjectsCount}</div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-text-primary">
              {passport.averageClientRating ? passport.averageClientRating.toFixed(1) : "—"}
            </div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Verified Skills */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-growth" /> Verified Skills
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Only skills with graded evidence from UPORA practical challenges or client validation are shown.
            Self-reported skills are excluded from public passports.
          </p>
        </div>

        {passport.verifiedSkills.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary">
            No verified skills on this passport yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {passport.verifiedSkills.map((s: any) => (
              <div key={s.slug} className="rounded-xl border border-emerald-800/40 bg-emerald-950/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="growth" className="text-[10px]">{s.tier}</Badge>
                  {s.confidenceScore > 0 && (
                    <span className="font-mono text-xs text-brand-growth font-bold">{s.confidenceScore}/100</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-text-primary">{s.name}</h4>
                <p className="text-[11px] text-text-secondary">{s.category}</p>
                {s.verifiedAt && (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified {new Date(s.verifiedAt).toLocaleDateString()}
                  </div>
                )}
                {s.evidence && (
                  <div className="rounded-lg border border-border-subtle bg-surface p-2 text-[11px] text-text-secondary space-y-0.5">
                    <div className="font-semibold text-text-primary">{s.evidence.challengeTitle}</div>
                    <div>Score: {s.evidence.score}/100 · {s.evidence.verdict}</div>
                    {s.evidence.feedback && (
                      <div className="line-clamp-2">{s.evidence.feedback}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio */}
      {passport.portfolio.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-growth" /> Verified Portfolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passport.portfolio.map((item: any) => (
              <Card key={item.id} className="border-border-subtle bg-surface">
                <CardContent className="p-4 space-y-2">
                  <Badge variant="growth" className="text-[10px]">Verified Evidence</Badge>
                  <h4 className="text-sm font-bold text-text-primary">{item.title}</h4>
                  <p className="text-xs text-text-secondary line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3 text-[11px]">
                    {item.liveDemoUrl && (
                      <a
                        href={item.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-growth hover:underline flex items-center gap-1"
                      >
                        Demo <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {item.repositoryUrl && (
                      <a
                        href={item.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-growth hover:underline flex items-center gap-1"
                      >
                        Repository <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Client Reviews */}
      {passport.reviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Star className="h-5 w-5 text-brand-growth" /> Client Reviews
          </h2>
          <div className="space-y-3">
            {passport.reviews.map((r: any, i: number) => (
              <div key={i} className="rounded-xl border border-border-subtle bg-surface p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">{r.authorName}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3 w-3 ${idx < r.ratingScore ? "text-amber-400 fill-amber-400" : "text-border-subtle"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-text-secondary">{r.feedbackPublic}</p>
                <div className="text-[10px] text-text-secondary">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 text-center space-y-1">
        <p className="text-xs text-text-secondary">
          This Skill Passport is issued by{" "}
          <Link href="/" className="text-brand-growth hover:underline font-semibold">
            UPORA
          </Link>{" "}
          — verified skills are backed by rubric-evaluated practical challenge submissions.
        </p>
        <p className="text-[10px] text-text-secondary">
          Passport ID: {passport.userId} · Verification tier: PROJECT_VERIFIED / CLIENT_VALIDATED only
        </p>
      </div>
    </div>
  );
}
