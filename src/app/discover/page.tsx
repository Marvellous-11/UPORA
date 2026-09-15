"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import {
  FOUNDATIONAL_CAREER_PATHS,
  calculateCareerMatches,
  CareerMatchResult,
} from "@/lib/career/recommendation";
import { analyzeSkillGap } from "@/lib/career/skill-gap";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function CareerNavigatorPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>("cloud-security");
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [profRes, roadRes] = await Promise.all([
          fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/roadmap").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (profRes?.profile) {
          setProfile(profRes.profile);
        }
        if (roadRes?.roadmap) {
          setActiveRoadmap(roadRes.roadmap);
          if (roadRes.roadmap.careerPath?.slug) {
            setSelectedSlug(roadRes.roadmap.careerPath.slug);
          }
        }
      } catch (e) {
        // Fallback to static defaults
      }
    }
    loadData();
  }, [user]);

  // Deterministic calculation
  const careerMatches: CareerMatchResult[] = useMemo(() => {
    return calculateCareerMatches({
      primaryGoal: profile?.primaryGoal,
      experienceLevel: profile?.experienceLevel,
      interests: profile?.interests || [],
      selfReportedSkillSlugs: profile?.skills?.map((s: any) => s.slug) || [],
      availabilityHoursPerWeek: profile?.availabilityHoursPerWeek || 20,
    });
  }, [profile]);

  const currentMatch =
    careerMatches.find((m) => m.careerPath.slug === selectedSlug) ||
    careerMatches[0];

  const currentPath = currentMatch.careerPath;

  const skillGapAnalysis = useMemo(() => {
    return analyzeSkillGap(
      profile?.skills || [],
      currentPath,
      profile?.availabilityHoursPerWeek || 20
    );
  }, [profile, currentPath]);

  const handleSetPrimary = async () => {
    if (!user) return;
    setIsActivating(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGoal: profile?.primaryGoal || "first_job",
          experienceLevel: profile?.experienceLevel || "BEGINNER",
          interests: profile?.interests || [currentPath.category],
          availabilityHoursPerWeek: profile?.availabilityHoursPerWeek || 20,
          skillSlugs: profile?.skills?.map((s: any) => s.slug) || [],
          chosenCareerSlug: currentPath.slug,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRoadmap(data.roadmap);
        setActivationSuccess(true);
        setTimeout(() => setActivationSuccess(false), 3000);
      }
    } catch (e) {
      // Handle error
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Navigator Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <Compass className="h-4 w-4" />
          <span>Deterministic Career Navigator & Skill Gap Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Career Direction & Competency Mapping
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          We compare your verified evidence against real global employer demand. All salary benchmarks and market fits are estimates based on standardized labor taxonomies, never guaranteed promises.
        </p>
      </div>

      {/* Career Trajectory Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {careerMatches.map((match) => {
          const path = match.careerPath;
          const isSelected = path.slug === selectedSlug;
          const isActiveTarget = activeRoadmap?.careerPath?.slug === path.slug;

          return (
            <button
              key={path.slug}
              type="button"
              onClick={() => setSelectedSlug(path.slug)}
              className={`text-left rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "border-brand-growth bg-surface ring-1 ring-brand-growth shadow-lg"
                  : "border-border-subtle bg-surface-subtle/50 hover:bg-surface-subtle hover:border-border-subtle"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={isSelected ? "growth" : "neutral"} className="text-[10px]">
                    {match.matchScore}% Match
                  </Badge>
                  {isActiveTarget && (
                    <span className="text-[10px] font-semibold text-brand-growth uppercase tracking-wider">
                      Active Target
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-text-primary leading-snug">
                  {path.title}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {path.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border-subtle/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Difficulty:</span>
                  <span className="font-medium text-text-primary">{path.entryDifficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Avg Salary:</span>
                  <span className="font-mono font-medium text-brand-growth">
                    ${path.averageGlobalSalaryUSD.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Inspection for Selected Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fit Analysis & Skill Gap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fit Rationale Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Labor Market & Capability Fit Analysis</CardTitle>
                <Badge variant="growth">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {currentMatch.matchScore}% Match
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Objective, deterministic rationale derived from your selected interests and verified skill portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-text-primary leading-relaxed bg-surface-subtle p-4 rounded-xl border border-border-subtle space-y-2">
                <div className="font-semibold text-brand-growth text-xs uppercase tracking-wider">
                  Explainable Match Rationale:
                </div>
                <p>{currentMatch.rationale}</p>
                <div className="text-xs text-text-secondary pt-1">
                  {skillGapAnalysis.summary}
                </div>
              </div>

              {/* Verified vs Missing Skills Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Competency Gap Breakdown ({skillGapAnalysis.coveragePercentage}% Covered)
                  </h4>
                  <span className="text-xs text-text-secondary">
                    Est. {skillGapAnalysis.estimatedWeeksToClose} week(s) to close
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Demonstrated Skills */}
                  {skillGapAnalysis.demonstratedSkills.map((ds) => (
                    <div
                      key={ds.slug}
                      className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-subtle/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-brand-growth shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-text-primary">
                          {ds.name}
                        </span>
                      </div>
                      <Badge variant="growth" className="text-[10px]">
                        Demonstrated ({ds.tier})
                      </Badge>
                    </div>
                  ))}

                  {/* Missing Gaps */}
                  {skillGapAnalysis.prioritizedGaps.map((gap) => (
                    <div
                      key={gap.skill.slug}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-border-subtle bg-surface-subtle/20 gap-2"
                    >
                      <div className="flex items-start sm:items-center gap-2.5">
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-text-primary block">
                            {gap.skill.name}
                          </span>
                          <span className="text-[11px] text-text-secondary">
                            {gap.reason}
                          </span>
                        </div>
                      </div>
                      <Badge variant="warning" className="text-[10px] shrink-0 self-start sm:self-center">
                        Priority {gap.priorityOrder} Gap
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Transparent Risks & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                <CardTitle className="text-base font-bold text-text-primary">
                  Market Realities & Risks
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                We do not sell illusions. Understand the genuine challenges of this trajectory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
              <div className="p-3.5 rounded-lg border border-amber-800/40 bg-amber-950/20 text-amber-200/90 text-xs space-y-1">
                {currentPath.riskFactors.map((rf, idx) => (
                  <p key={idx}>{rf}</p>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                  Ethical Principle:
                </h5>
                <p className="text-xs text-text-secondary">
                  UPORA does not promise passive wealth or guaranteed hiring. Economic mobility comes from completing practical sandbox challenges and building verified proof of work that clients trust.
                </p>
              </div>

              <div className="pt-3">
                {user ? (
                  <Button
                    onClick={handleSetPrimary}
                    className="w-full"
                    disabled={isActivating || activeRoadmap?.careerPath?.slug === currentPath.slug}
                    variant={activeRoadmap?.careerPath?.slug === currentPath.slug ? "secondary" : "primary"}
                  >
                    {activationSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-emerald-400" />
                        Roadmap Activated!
                      </>
                    ) : activeRoadmap?.careerPath?.slug === currentPath.slug ? (
                      "Current Active Roadmap"
                    ) : (
                      "Set As My Active Career Target"
                    )}
                  </Button>
                ) : (
                  <Link href="/register?redirect=/discover">
                    <Button variant="primary" className="w-full">
                      Sign Up to Activate Roadmap
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
