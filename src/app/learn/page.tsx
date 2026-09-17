"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function LearnPage() {
  const [modules, setModules] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load challenges"))))
      .then((data) => setModules(data.modules || []))
      .catch(() => setError("Unable to load challenges right now."));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <BookOpen className="h-4 w-4" />
          <span>Practical Learning & Evidence Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Learn by Building. Prove by Submitting.
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          Every module culminates in a practical challenge evaluated against a transparent rubric. Passing attaches a verified badge to your Skill Passport.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 text-rose-300 p-4 text-sm">
          {error}
        </div>
      )}

      {modules === null && !error ? (
        <div className="text-sm text-text-secondary">Loading practical challenges…</div>
      ) : modules?.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-subtle p-6 text-sm text-text-secondary">
          Challenges are not published yet. Run <code className="font-mono">npm run db:seed</code> to load the starter catalog.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules!.map((mod) => (
            <Card
              key={mod.id}
              className="border-border-subtle hover:border-brand-growth/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={mod.skillVerified ? "growth" : "neutral"} className="text-[10px]">
                    {mod.skillVerified ? "Skill Verified" : mod.skill.category}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock className="h-3.5 w-3.5" />
                    <span>~{mod.estimatedMinutes} min</span>
                  </div>
                </div>

                <div>
                  <CardTitle className="text-lg font-bold text-text-primary leading-snug">
                    {mod.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 leading-relaxed">
                    {mod.summary}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border-subtle bg-surface-subtle p-3 text-xs">
                  <div className="font-semibold text-text-primary">Skill:</div>
                  <div className="text-brand-growth font-medium">{mod.skill.name}</div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-text-secondary uppercase tracking-wider text-[10px]">
                    {mod.challenges.length} challenge(s)
                  </div>
                  <ul className="space-y-1 text-text-secondary">
                    {mod.challenges.slice(0, 2).map((c: any) => (
                      <li key={c.id} className="flex items-center gap-1.5">
                        <span className="text-brand-growth font-mono font-bold">•</span>
                        <span>{c.title}</span>
                      </li>
                    ))}
                  </ul>
                  {mod.challenges.every((c: any) => c.mySubmission?.status === "PASSED") && (
                    <div className="text-brand-growth font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> All challenges verified
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <div className="text-xs text-text-secondary">
                    {mod.challenges.some((c: any) => c.mySubmission) ? (
                      <span className="text-brand-growth font-medium">Submission on file — view status</span>
                    ) : (
                      "Ready for your first submission"
                    )}
                  </div>
                  <Link href={`/learn/${mod.slug}`}>
                    <Button size="sm" variant="primary">
                      <span>Open Module</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}