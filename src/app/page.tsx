"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { useUpora } from "@/lib/store/useUporaStore";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Compass,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const store = useUpora();

  const [profileData, setProfileData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [nextActionData, setNextActionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [nextActionRes, profileRes, roadmapRes] = await Promise.all([
          fetch("/api/next-action").then((r) => (r.ok ? r.json() : null)),
          user ? fetch("/api/profile").then((r) => (r.ok ? r.json() : null)) : null,
          user ? fetch("/api/roadmap").then((r) => (r.ok ? r.json() : null)) : null,
        ]);

        if (nextActionRes?.nextAction) {
          setNextActionData(nextActionRes.nextAction);
        }
        if (profileRes?.profile) {
          setProfileData(profileRes.profile);
        }
        if (roadmapRes?.roadmap) {
          setRoadmapData(roadmapRes.roadmap);
        }
      } catch (err) {
        // Fall back gracefully to store defaults
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  // Derived user display info
  const fullName = profileData?.fullName || user?.fullName || "Opportunity Seeker";
  const firstName = fullName.split(" ")[0];
  const targetRole =
    profileData?.targetRole ||
    roadmapData?.careerPath?.title ||
    store.profile.targetRole;
  const reputationScore = profileData?.reputationScore ?? 100.0;
  const verifiedSkillsCount = profileData?.verifiedSkillsCount ?? 0;
  const hasCompletedOnboarding = profileData?.onboardingCompleted ?? false;
  const skillsList = profileData?.skills || store.skills;
  const nextAction = nextActionData || store.nextActions[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* 0. ONBOARDING INCOMPLETE BANNER (For newly registered users) */}
      {user && !hasCompletedOnboarding && !loading && (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 to-slate-900 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="growth">Action Required</Badge>
              <span className="text-xs text-emerald-400 font-mono">Step {profileData?.onboardingStep || 1} of 6</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Complete Your Diagnostic Career Profile
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Establish your starting skills, time commitment, and goals to generate your personalized 5-phase career roadmap and qualify for paid work.
            </p>
          </div>
          <Link href="/onboarding" className="shrink-0">
            <Button variant="primary" size="md">
              Complete Onboarding
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* 1. Calm, Actionable Header Greeting & Direction */}
      <section className="rounded-2xl border border-border-subtle bg-gradient-to-b from-surface to-surface-subtle/40 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-growth">
                Current Career Trajectory
              </span>
              <span className="text-text-secondary">·</span>
              <span className="text-xs text-text-secondary">
                {profileData?.timezone || store.profile.timezone}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Good day, {firstName}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl">
              Target Role: <strong className="text-text-primary font-medium">{targetRole}</strong>.
              {hasCompletedOnboarding
                ? " Your active roadmap milestones guide you from fundamentals to verified proof of work."
                : " Complete onboarding to establish your verified learning path."}
            </p>
          </div>

          {/* Real Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-[11px] font-medium text-text-secondary uppercase">Reputation</div>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="h-4 w-4 text-brand-growth" />
                <span className="text-lg font-bold text-text-primary">
                  {reputationScore.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-[11px] font-medium text-text-secondary uppercase">Verified Skills</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-lg font-bold text-text-primary">
                  {verifiedSkillsCount}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-3.5 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-medium text-text-secondary uppercase">Balance</div>
              <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-lg text-brand-growth">
                {/* Genuine wallet balance: $0.00 for newly registered accounts */}
                {user ? formatCurrency(0.0) : formatCurrency(store.financials.availableBalanceUSD)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CENTRAL QUESTION: "What should I do next?" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              What should I do next?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Prioritized daily action derived from your skill gap, active submissions, and matched marketplace demand.
            </p>
          </div>
          {nextAction?.badgeText && (
            <Badge variant="growth">
              {nextAction.badgeText}
            </Badge>
          )}
        </div>

        {/* Primary Highlighted Next Best Action */}
        {nextAction && (
          <Card className="border-brand-growth/50 bg-surface/90 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="focus">Priority Focus</Badge>
                    <span className="text-xs font-mono text-text-secondary">
                      {nextAction.actionType || "DIAGNOSTIC"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">
                    {nextAction.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {nextAction.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link href={nextAction.ctaUrl || "/onboarding"}>
                    <Button variant="primary" size="lg" className="w-full">
                      {nextAction.ctaLabel || "Proceed"}
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* 3. ACTIVE ROADMAP MILESTONES (If user has generated roadmap) */}
      {roadmapData?.milestones && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">
                Active Career Roadmap: {roadmapData.careerPath?.title}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Sequential progression milestones towards verified production readiness.
              </p>
            </div>
            <Link href="/discover" className="text-xs text-brand-growth hover:underline flex items-center gap-1">
              Explore All Paths <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {roadmapData.milestones.map((milestone: any, index: number) => {
              const isDone = milestone.isCompleted;
              const isCurrent = !isDone && (index === 0 || roadmapData.milestones[index - 1]?.isCompleted);

              return (
                <div
                  key={milestone.id || index}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                    isDone
                      ? "bg-emerald-950/20 border-emerald-800/60"
                      : isCurrent
                      ? "bg-slate-900 border-brand-growth ring-1 ring-brand-growth/50 shadow-md"
                      : "bg-slate-950/50 border-slate-800/80 opacity-70"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        PHASE {milestone.stepOrder}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Badge variant="growth" className="text-[9px] px-1.5 py-0">Current</Badge>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {milestone.title}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{milestone.actionType}</span>
                    {isCurrent && (
                      <Link href={milestone.actionType === "PRACTICE_PROJECT" ? "/challenges" : "/learning"}>
                        <span className="text-emerald-400 font-semibold hover:underline">Start &rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. VERIFIED SKILLS & PROOF OF WORK */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Skill Portfolio & Verification Tiers
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Distinguishing self-reported claims from objectively tested and client-validated deliverables.
            </p>
          </div>
          <Link href="/learning" className="text-xs text-brand-growth hover:underline flex items-center gap-1">
            Practical Sandbox <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsList.slice(0, 6).map((skill: any) => {
            const isSelfReported = skill.tier === "SELF_REPORTED";
            return (
              <div
                key={skill.id || skill.slug}
                className="rounded-xl border border-border-subtle bg-surface p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={isSelfReported ? "warning" : "growth"} className="text-[10px]">
                      {isSelfReported ? "SELF-REPORTED" : "PROJECT-VERIFIED"}
                    </Badge>
                    <span className="text-[11px] font-mono text-text-secondary">
                      {isSelfReported ? "Pending Proof" : "Evaluated"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary pt-1">
                    {skill.name}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {skill.category || "Core Competency"}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Status:</span>
                  <span className={`font-semibold ${isSelfReported ? "text-amber-400" : "text-emerald-400"}`}>
                    {isSelfReported ? "Take Assessment" : "Verified 100%"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LIVE MARKETPLACE DEMAND & OPPORTUNITIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Matched Paid Tasks & Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Verified client deliverables with funds locked in secure escrow contracts.
            </p>
          </div>
          <Link href="/tasks" className="text-xs text-brand-growth hover:underline flex items-center gap-1">
            Browse All Work <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {store.marketplaceTasks.map((task) => (
            <Card key={task.id} className="border-border-subtle bg-surface hover:border-brand-growth/40 transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="growth">Escrow Protected</Badge>
                  <span className="font-mono font-bold text-brand-growth text-base">
                    {formatCurrency(task.budgetUSD)}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-sm">{task.title}</h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{task.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/60 text-xs text-text-secondary">
                  <span>Client: {task.clientName}</span>
                  <Link href="/tasks" className="text-brand-growth hover:underline font-semibold">
                    Apply With Skills &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
