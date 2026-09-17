"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  Star,
  Briefcase,
} from "lucide-react";

export default function PassportPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load profile"))))
      .then((data) => setProfile(data.profile))
      .catch(() => setError("Unable to load your Skill Passport right now."))
      .finally(() => setLoading(false));
  }, [user]);

  const copyShareLink = () => {
    if (!user) return;
    const url = `${window.location.origin}/passport/${user.userId || ""}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Sign in to view your Skill Passport</h1>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-text-secondary">Loading Skill Passport…</div>;
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-4">
        <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error || "Profile not found."}</span>
        </div>
      </div>
    );
  }

  const verifiedSkills = (profile.skills || []).filter((s: any) => s.tier !== "SELF_REPORTED");
  const selfReportedSkills = (profile.skills || []).filter((s: any) => s.tier === "SELF_REPORTED");
  const portfolioItems = profile.portfolioItems || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <Award className="h-4 w-4" />
          <span>Skill Passport</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {profile.fullName}
            </h1>
            {profile.headline && (
              <p className="text-sm text-text-secondary mt-1">{profile.headline}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={copyShareLink}>
              {copied ? (
                <><Check className="h-4 w-4 mr-1.5 text-emerald-400" /> Copied!</>
              ) : (
                <><Copy className="h-4 w-4 mr-1.5" /> Share Passport</>
              )}
            </Button>
            <Link href="/profile">
              <Button variant="ghost">Edit Profile</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reputation & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
          <div className="text-[11px] text-text-secondary uppercase tracking-wider">Reputation</div>
          <div className="flex items-center gap-1.5 mt-1">
            <ShieldCheck className="h-4 w-4 text-brand-growth" />
            <span className="text-xl font-black text-text-primary">
              {Number(profile.reputationScore).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
          <div className="text-[11px] text-text-secondary uppercase tracking-wider">Verified Skills</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Award className="h-4 w-4 text-emerald-400" />
            <span className="text-xl font-black text-text-primary">{profile.verifiedSkillsCount}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
          <div className="text-[11px] text-text-secondary uppercase tracking-wider">Completed Projects</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Briefcase className="h-4 w-4 text-blue-400" />
            <span className="text-xl font-black text-text-primary">{profile.completedProjectsCount}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
          <div className="text-[11px] text-text-secondary uppercase tracking-wider">Country</div>
          <div className="text-xl font-black text-text-primary mt-1">{profile.countryCode || "—"}</div>
        </div>
      </div>

      {/* Verified Skills */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Verified Skills</h2>
          <p className="text-xs text-text-secondary mt-1">
            Skills with graded evidence from practical challenges or client validation.
          </p>
        </div>

        {verifiedSkills.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary space-y-2">
            <p>No verified skills yet.</p>
            <Link href="/learn" className="text-brand-growth hover:underline text-xs flex items-center gap-1">
              Complete a practical challenge to earn your first verified badge <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedSkills.map((s: any) => (
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
              </div>
            ))}
          </div>
        )}

        {selfReportedSkills.length > 0 && (
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Self-Reported (unverified)
            </div>
            <div className="flex flex-wrap gap-2">
              {selfReportedSkills.map((s: any) => (
                <span
                  key={s.slug}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-amber-800/40 bg-amber-950/10 text-amber-300"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio */}
      {portfolioItems.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Portfolio & Evidence</h2>
            <p className="text-xs text-text-secondary mt-1">
              Verified entries are linked to graded challenge submissions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioItems.map((item: any) => (
              <Card key={item.id} className="border-border-subtle bg-surface">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={item.verifiedBadge ? "growth" : "neutral"} className="text-[10px]">
                      {item.verifiedBadge ? "Verified Evidence" : "Self-Published"}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">{item.title}</h4>
                  <p className="text-xs text-text-secondary line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-3 text-[11px]">
                    {item.liveDemoUrl && (
                      <a href={item.liveDemoUrl} target="_blank" rel="noreferrer" className="text-brand-growth hover:underline">
                        Demo
                      </a>
                    )}
                    {item.repositoryUrl && (
                      <a href={item.repositoryUrl} target="_blank" rel="noreferrer" className="text-brand-growth hover:underline">
                        Repository
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Star className="h-4 w-4 text-brand-growth" /> About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary leading-relaxed">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Public passport link */}
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">Public passport visibility: </span>
          {profile.isPassportPublic ? "Public — shareable with clients and employers." : "Private — only visible to you."}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button variant="ghost" size="sm">Change visibility</Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={copyShareLink}>
            {copied ? "Copied!" : "Copy share link"}
          </Button>
        </div>
      </div>
    </div>
  );
}
