"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, ShieldCheck, Award, FileText, Sparkles, Copy, Check } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ChallengeDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [deliverableText, setDeliverableText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const reloadDetail = async (challengeId: string) => {
    const res = await fetch(`/api/challenges/${challengeId}`);
    if (res.ok) setChallenge((await res.json()).challenge);
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const listRes = await fetch("/api/challenges");
        if (!listRes.ok) throw new Error("Failed to load modules");
        const data = await listRes.json();
        const mod = (data.modules || []).find((m: any) => m.slug === slug);
        if (!mod || mod.challenges.length === 0) {
          if (!cancelled) setError("No challenge found for this module.");
          return;
        }
        const detailRes = await fetch(`/api/challenges/${mod.challenges[0].id}`);
        if (!detailRes.ok) throw new Error("Failed to load challenge");
        if (!cancelled) setChallenge((await detailRes.json()).challenge);
      } catch (e) {
        if (!cancelled) setError("Unable to load this challenge right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handlePreFillSample = () => {
    setDeliverableText(
      `# Engineering Implementation Report

## 1. Problem Analysis
This deliverable addresses the core engineering objective with a production-grade approach.

## 2. Implementation
- Configured baseline security: key-based authentication, rate limiting and strict firewall zones.
- Automated remediation: monitoring jails blocked the offending subnets immediately.
- Verification: unit tests and log checks confirmed the mitigation blocks the attack vector.

## 3. Key Artifact
\`\`\`bash
sudo iptables -I INPUT -s 198.51.100.0/24 -j DROP
\`\`\`

## 4. Validation & Evidence
- Test results confirmed dropped packets on the offending subnet.
- The solution satisfies the acceptance criteria defined in the rubric.`
    );
  };

  const handleSubmit = async () => {
    if (!deliverableText.trim() || !challenge) return;
    setError(null);
    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverableContent: deliverableText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission could not be processed.");
        return;
      }
      setEvaluation(data.evaluation);
      setShowModal(true);
      await reloadDetail(challenge.id);
    } catch (e) {
      setError("Network error while submitting your work.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const copyHash = () => {
    if (!evaluation?.evidenceHash) return;
    navigator.clipboard.writeText(evaluation.evidenceHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-text-secondary">Loading challenge…</div>;
  }

  if (error && !challenge) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <Link href="/learn" className="text-xs text-brand-growth hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> All modules
        </Link>
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 text-rose-300 p-4 text-sm">{error}</div>
        <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const lastAttempt = challenge?.mySubmissions?.[0] ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <Link href="/learn" className="text-xs text-brand-growth hover:underline flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> All modules
      </Link>

      {error && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 text-rose-300 p-4 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="focus" className="text-[10px]">{challenge.module.skill.name}</Badge>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Clock className="h-3.5 w-3.5" />
              <span>~{challenge.module.estimatedMinutes} min</span>
            </div>
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-text-primary leading-snug">
              {challenge.title}
            </CardTitle>
            <CardDescription className="text-sm mt-1 leading-relaxed">{challenge.problemBrief}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border-subtle bg-surface-subtle p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5 text-brand-growth" /> Deliverable Format
            </div>
            <p className="text-xs text-text-secondary">{challenge.expectedDeliverableFormat}</p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-subtle p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-growth" />
              Rubric ({challenge.rubricCriteria.length} criteria · pass &ge; {challenge.passingScore}/100)
            </div>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              {challenge.rubricCriteria.map((c: any) => (
                <li key={c.title} className="flex items-center justify-between">
                  <span>{c.title}</span>
                  <span className="font-mono text-brand-growth">{c.weight}%</span>
                </li>
              ))}
            </ul>
          </div>

          {lastAttempt ? (
            <div className="rounded-lg border border-border-subtle bg-surface-subtle p-4 text-xs space-y-1">
              <div className="font-semibold uppercase tracking-wider text-text-primary">Last submission</div>
              <div className="text-text-secondary">
                Attempt {lastAttempt.attemptNumber} ·{" "}
                <Badge variant={lastAttempt.status === "PASSED" ? "growth" : lastAttempt.status === "REJECTED" ? "risk" : "warning"} className="text-[9px]">
                  {lastAttempt.status}{lastAttempt.evaluationScore !== null ? ` · ${lastAttempt.evaluationScore}/100` : ""}
                </Badge>
              </div>
              {lastAttempt.feedbackSummary && <p className="text-text-secondary pt-1">{lastAttempt.feedbackSummary}</p>}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Submit your deliverable</CardTitle>
          <CardDescription className="text-xs">
            Write your deliverable directly. Submissions are evaluated by the deterministic UPORA rubric engine and persisted to PostgreSQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            label="Deliverable"
            rows={9}
            value={deliverableText}
            onChange={(e) => setDeliverableText(e.target.value)}
            placeholder="Paste or write your complete deliverable here..."
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreFillSample}
              className="text-xs text-brand-growth hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" /> Pre-fill a sample deliverable
            </button>
            <Button onClick={handleSubmit} isLoading={isEvaluating} disabled={deliverableText.trim().length < 50}>
              Submit for Evaluation
            </Button>
          </div>
          {deliverableText.trim().length > 0 && deliverableText.trim().length < 50 && (
            <p className="text-xs text-amber-400/80">Deliverable must be at least 50 characters.</p>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={evaluation?.passed ? "Submission Passed" : "Submission Evaluated"}
        description="Deterministic rubric evaluation result"
        maxWidth="2xl"
      >
        {evaluation && (
          <div className="space-y-4 text-sm">
            <div
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{ borderColor: evaluation.passed ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)" }}
            >
              {evaluation.passed ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-8 w-8 text-rose-400 shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-bold text-text-primary">
                  {evaluation.passed ? "Skill Passport badge issued" : "Below the passing threshold"}
                </div>
                <div className="text-xs text-text-secondary">Passing score {evaluation.passingScore}/100</div>
              </div>
              <div className="font-mono text-3xl font-black text-text-primary">
                {evaluation.score}
                <span className="text-xs font-normal text-text-secondary">/100</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Evaluator Summary</h4>
              <p className="text-text-secondary bg-surface-subtle p-3 rounded-lg border border-border-subtle mt-1">
                {evaluation.summary}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Evidence Found</h4>
              <ul className="mt-1 space-y-1">
                {evaluation.evidenceFound.map((item: string) => (
                  <li key={item} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Specific Improvements</h4>
              <ul className="mt-1 space-y-1">
                {evaluation.specificImprovements.map((item: string) => (
                  <li key={item} className="text-xs text-amber-300/90 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {evaluation.evidenceHash && (
              <div className="p-2 rounded bg-black/50 border border-border-subtle font-mono text-[11px] text-brand-growth break-all flex items-center justify-between gap-2">
                <span className="select-all">{evaluation.evidenceHash.slice(0, 32)}…</span>
                <button onClick={copyHash} className="text-text-secondary hover:text-text-primary shrink-0" aria-label="Copy evidence hash">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
              <Link href="/passport">
                <Button variant="secondary">
                  <Award className="h-4 w-4 mr-1.5" /> View Skill Passport
                </Button>
              </Link>
              <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}