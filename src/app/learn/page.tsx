"use client";

import Link from "next/link";
import { useUpora } from "@/lib/store/useUporaStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";

export default function LearnPage() {
  const { challenges, skills } = useUpora();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <BookOpen className="h-4 w-4" />
          <span>Practical Learning & Evidence Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Learn by Building. Prove by Submitting.
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          UPORA replaces passive video watching with real-world technical deliverables. Every module culminates in an objective practical challenge evaluated against transparent industry rubrics.
        </p>
      </div>

      {/* Philosophy Callout */}
      <div className="rounded-xl border border-border-subtle bg-surface-subtle/60 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-growth/15 text-brand-growth font-bold text-sm">
            6-STEP
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Learn → Practice → Build → Assess → Feedback → Retry
            </h3>
            <p className="text-xs text-text-secondary">
              Passing a challenge attaches a cryptographically verifiable badge to your Skill Passport, instantly unlocking client tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => {
          const isVerified = skills.some((s) => s.evidenceTitle?.includes(challenge.title.slice(0, 20)));

          return (
            <Card
              key={challenge.id}
              className="border-border-subtle hover:border-brand-growth/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={isVerified ? "growth" : "neutral"} className="text-[10px]">
                    {isVerified ? "Completed & Verified" : challenge.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock className="h-3.5 w-3.5" />
                    <span>~{challenge.estimatedHours} hrs</span>
                  </div>
                </div>

                <div>
                  <CardTitle className="text-lg font-bold text-text-primary leading-snug">
                    {challenge.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 leading-relaxed">
                    {challenge.summary}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border-subtle bg-surface-subtle p-3 space-y-1.5 text-xs">
                  <div className="font-semibold text-text-primary">Economic Mobility Unlocked:</div>
                  <div className="text-brand-growth font-medium">{challenge.unlocksWorkTier}</div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-text-secondary font-medium uppercase tracking-wider text-[10px]">
                    Rubric Criteria ({challenge.rubricCriteria.length} checks · Passing score: {challenge.passingScore}/100):
                  </div>
                  <ul className="space-y-1 text-text-secondary">
                    {challenge.rubricCriteria.slice(0, 3).map((crit) => (
                      <li key={crit.id} className="flex items-center gap-1.5">
                        <span className="text-brand-growth font-mono font-bold">•</span>
                        <span>{crit.title} ({crit.weight}%)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-xs text-text-secondary">
                    {isVerified ? (
                      <span className="text-brand-growth font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Badge in Passport
                      </span>
                    ) : (
                      "Ready for submission"
                    )}
                  </div>
                  <Link href={`/learn/${challenge.moduleSlug}`}>
                    <Button size="sm" variant={isVerified ? "secondary" : "primary"}>
                      <span>{isVerified ? "Review Submission" : "Commence Challenge"}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
