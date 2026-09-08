"use client";

import Link from "next/link";
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
} from "lucide-react";

export default function HomePage() {
  const {
    profile,
    nextActions,
    skills,
    marketplaceTasks,
    opportunities,
    financials,
    selectedCareerPath,
  } = useUpora();

  const savingsPercent = Math.round(
    (financials.currentGoalSavedUSD / financials.currentGoalTargetUSD) * 100
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* 1. Founder-Specified Header: Calm, Actionable Greeting & Core Direction */}
      <section className="rounded-2xl border border-border-subtle bg-gradient-to-b from-surface to-surface-subtle/40 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-growth">
                Current Career Trajectory
              </span>
              <span className="text-text-secondary">·</span>
              <span className="text-xs text-text-secondary">{profile.timezone}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Good morning, {profile.fullName.split(" ")[0]}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl">
              Target Role: <strong className="text-text-primary font-medium">{profile.targetRole}</strong>.
              Your next verified milestone unlocks access to intermediate infrastructure maintenance contracts.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-[11px] font-medium text-text-secondary uppercase">Reputation</div>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="h-4 w-4 text-brand-growth" />
                <span className="text-lg font-bold text-text-primary">{profile.reputationScore.toFixed(1)}%</span>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-3.5">
              <div className="text-[11px] font-medium text-text-secondary uppercase">Verified Skills</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-lg font-bold text-text-primary">{skills.length}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-3.5 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-medium text-text-secondary uppercase">Balance</div>
              <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-lg text-brand-growth">
                {formatCurrency(financials.availableBalanceUSD)}
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
              Prioritized daily actions derived from your skill gap, active submissions, and matched marketplace demand.
            </p>
          </div>
          <Badge variant="growth" className="hidden sm:inline-flex">
            {nextActions.length} Actions Ready
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextActions.map((action, idx) => (
            <Card
              key={action.id}
              className="relative overflow-hidden border-border-subtle hover:border-brand-growth/40 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-subtle text-xs font-bold text-brand-growth border border-border-subtle font-mono">
                      0{idx + 1}
                    </span>
                    <Badge
                      variant={
                        action.category === "PRACTICE" || action.category === "LEARN"
                          ? "growth"
                          : action.category === "WORK"
                          ? "focus"
                          : "neutral"
                      }
                    >
                      {action.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{action.estimatedMinutes}m</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-text-primary leading-snug">
                    {action.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-brand-growth">
                    {action.rewardOrImpact}
                  </span>
                  <Link href={action.actionHref}>
                    <Button size="sm" variant={idx === 0 ? "primary" : "secondary"}>
                      <span>{action.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Core Ecosystem Grid: Learn, Work, Earn, Prove */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Learning & Marketplace Overviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Practical Learning & Skills Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Practical Skills & Evidence</CardTitle>
                <CardDescription className="text-xs">
                  Skills proven through objective challenge rubrics and client-validated work.
                </CardDescription>
              </div>
              <Link href="/passport">
                <Button size="sm" variant="ghost">
                  <span>View Passport</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {skills.slice(0, 4).map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-subtle/50"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{skill.name}</span>
                      <Badge
                        variant={skill.tier === "PROJECT_VERIFIED" ? "growth" : "focus"}
                        className="text-[10px]"
                      >
                        {skill.tier.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="text-xs text-text-secondary flex items-center gap-2">
                      <span>{skill.category}</span>
                      <span>·</span>
                      <span className="font-mono text-emerald-400 font-medium">Score: {skill.score}/100</span>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-brand-growth shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Available Paid Tasks Matching Demonstrated Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Matched Marketplace Work</CardTitle>
                <CardDescription className="text-xs">
                  Legitimate client tasks funded in escrow, gated strictly by demonstrated abilities.
                </CardDescription>
              </div>
              <Link href="/work">
                <Button size="sm" variant="ghost">
                  <span>Explore Tasks</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketplaceTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-subtle/50 hover:border-border-subtle transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{task.title}</span>
                      <Badge variant="focus" className="text-[10px]">
                        {task.tierLabel}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Client: <span className="text-text-primary">{task.clientName}</span> ({task.clientRating} ★ · {task.clientCompletedJobs} jobs)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="font-mono font-bold text-brand-growth">
                        {formatCurrency(task.budgetUSD)}
                      </div>
                      <div className="text-[10px] text-text-secondary">Escrow Funded</div>
                    </div>
                    <Link href="/work">
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Financial Health & Verified Opportunities */}
        <div className="space-y-6">
          {/* Financial Progress Widget (Founder Mandated Example) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Financial Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-brand-growth" />
              </div>
              <CardDescription className="text-xs">
                Non-custodial telemetry connecting verified work with personal economic milestones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border-subtle bg-surface-subtle">
                  <div className="text-[11px] text-text-secondary font-medium uppercase">Income This Month</div>
                  <div className="mt-1 font-mono text-xl font-bold text-text-primary">
                    {formatCurrency(financials.incomeThisMonth)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border-subtle bg-surface-subtle">
                  <div className="text-[11px] text-text-secondary font-medium uppercase">Saved This Month</div>
                  <div className="mt-1 font-mono text-xl font-bold text-brand-growth">
                    {formatCurrency(financials.savedThisMonth)}
                  </div>
                </div>
              </div>

              {/* Goal Progress Bar */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border-subtle bg-surface-subtle/40">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-text-primary">{financials.currentGoalTitle}</span>
                  <span className="font-mono text-brand-growth font-bold">{savingsPercent}%</span>
                </div>
                <Progress value={savingsPercent} />
                <div className="flex justify-between text-[11px] text-text-secondary font-mono">
                  <span>{formatCurrency(financials.currentGoalSavedUSD)}</span>
                  <span>Target: {formatCurrency(financials.currentGoalTargetUSD)}</span>
                </div>
              </div>

              <Link href="/finance" className="block w-full">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Financial Goals
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Verified External Opportunities */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Verified Opportunities</CardTitle>
                <ShieldCheck className="h-4 w-4 text-blue-400" />
              </div>
              <CardDescription className="text-xs">
                Checked against official domains, authentic origins, and transparent terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunities.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 rounded-lg border border-border-subtle bg-surface-subtle/50 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-text-primary leading-tight">
                      {opp.title}
                    </h4>
                    <Badge
                      variant={
                        opp.trustStatus === "VERIFIED"
                          ? "growth"
                          : opp.trustStatus === "NEEDS_REVIEW"
                          ? "warning"
                          : "risk"
                      }
                      className="text-[9px] shrink-0"
                    >
                      {opp.trustStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-secondary">
                    <span>{opp.organization}</span>
                    <span className="font-medium text-text-primary">{opp.compensation}</span>
                  </div>
                </div>
              ))}

              <Link href="/opportunities" className="block w-full pt-1">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Browse Opportunity Index</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
