"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useUpora } from "@/lib/store/useUporaStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  Copy,
  Check,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ChallengeDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { challenges, evaluateChallengeSubmission } = useUpora();

  const challenge = challenges.find((c) => c.moduleSlug === slug) || challenges[0];

  const [deliverableText, setDeliverableText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [copiedResource, setCopiedResource] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    passed: boolean;
    score: number;
    summary: string;
    evidenceFound: string;
    specificImprovements: string;
    evidenceHash?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCopyResource = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedResource(true);
    setTimeout(() => setCopiedResource(false), 2000);
  };

  const handlePreFillSample = () => {
    setDeliverableText(`# INCIDENT RESPONSE REPORT: PRODUCTION AUTH GATEWAY BRUTE-FORCE

## 1. Executive Summary
On September 4 at 03:14 UTC, the UPORA production auth gateway experienced a coordinated dictionary brute-force attack originating from the synchronized botnet cluster at 198.51.100.0/24. Latency spiked to 35ms with 340 consecutive authentication failures across administrative accounts ('admin', 'root', 'superadmin'). No credential compromises occurred.

## 2. Attack Vector & Identification
- Attack Type: Automated Distributed Dictionary Brute-Force.
- User-Agent Signature: 'Go-http-client/1.1' executing automated requests at 1-second intervals.
- Target Scope: High-privilege administrative accounts.

## 3. Offending Subnet Isolation
Correlated telemetry demonstrates synchronized ingress traffic originating exclusively from the /24 CIDR subnet:
Offending Subnet: 198.51.100.0/24

## 4. Immediate Mitigation & Firewall Rules
Applied immediate perimeter drop via iptables and Cloudflare WAF:
\`\`\`bash
# Immediate kernel-level drop for the attacking subnet
sudo iptables -I INPUT -s 198.51.100.0/24 -j DROP

# Save iptables persistence
sudo iptables-save | sudo tee /etc/iptables/rules.v4
\`\`\`

## 5. Long-Term Hardening & Preventive Architecture
1. Implement IP-based dynamic rate limiting (max 5 failed attempts per 15 minutes per IP).
2. Enforce Mandatory Multi-Factor Authentication (MFA / TOTP) across all administrative accounts.
3. Configure Fail2ban jail on authentication service endpoints.
4. Deploy CAPTCHA friction upon detecting 3 consecutive failures from any client subnet.`);
  };

  const handleSubmitEvaluation = async () => {
    if (!deliverableText.trim()) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateChallengeSubmission(challenge.id, deliverableText);
      setEvaluationResult(result);
      setShowModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Practical Modules</span>
        </Link>
      </div>

      {/* Challenge Title Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="growth">{challenge.category}</Badge>
          <Badge variant="neutral">Difficulty: {challenge.difficulty}</Badge>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Clock className="h-3.5 w-3.5" />
            <span>Estimated time: {challenge.estimatedHours} hours</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {challenge.title}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          {challenge.summary}
        </p>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Brief, Starter Resources & Deliverable Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Brief */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Scenario & Problem Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-text-primary leading-relaxed whitespace-pre-line bg-surface-subtle p-4 rounded-xl border border-border-subtle font-mono text-xs">
                {challenge.problemBrief}
              </div>
            </CardContent>
          </Card>

          {/* Starter Resources / Raw Logs */}
          {challenge.starterResources.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-focus" />
                  <CardTitle className="text-base font-bold">
                    Starter Resource: {challenge.starterResources[0].name}
                  </CardTitle>
                </div>
                {challenge.starterResources[0].content && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyResource(challenge.starterResources[0].content || "")}
                  >
                    {copiedResource ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-brand-growth" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        <span>Copy Logs</span>
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border-subtle bg-black/60 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-56">
                  <pre>{challenge.starterResources[0].content}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deliverable Submission Form */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Your Deliverable</CardTitle>
                  <CardDescription className="text-xs">
                    {challenge.deliverableInstructions}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreFillSample}
                  title="Insert a complete, high-quality sample submission for testing the evaluation engine"
                >
                  Insert Benchmark Solution
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste or write your structured Markdown Incident Report here..."
                rows={12}
                value={deliverableText}
                onChange={(e) => setDeliverableText(e.target.value)}
                className="font-mono text-xs leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-secondary">
                  Word count: {deliverableText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <Button
                  onClick={handleSubmitEvaluation}
                  isLoading={isEvaluating}
                  disabled={!deliverableText.trim() || isEvaluating}
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  <span>Submit for Rubric Evaluation</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Transparent Rubric Criteria */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Evaluation Rubric</CardTitle>
                <Badge variant="growth" className="text-[10px]">
                  Passing: {challenge.passingScore}/100
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Evaluations are objective and criterion-based. No subjective grading.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenge.rubricCriteria.map((crit) => (
                <div
                  key={crit.id}
                  className="p-3 rounded-lg border border-border-subtle bg-surface-subtle/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">
                      {crit.title}
                    </span>
                    <span className="font-mono text-xs font-bold text-brand-growth">
                      {crit.weight}%
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {crit.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Unlocked Work Impact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Marketplace Unlock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p>
                Upon passing this challenge with an 80+ score, a verified badge is added to your public Skill Passport.
              </p>
              <div className="p-3 rounded-lg border border-border-subtle bg-surface-subtle font-medium text-text-primary">
                Unlocks: <span className="text-brand-growth">{challenge.unlocksWorkTier}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Evaluation Results Modal */}
      {evaluationResult && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={evaluationResult.passed ? "Challenge Completed & Verified!" : "Evaluation Scorecard"}
          maxWidth="xl"
        >
          <div className="space-y-5">
            {/* Score Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                evaluationResult.passed
                  ? "border-emerald-800/80 bg-emerald-950/40 text-emerald-300"
                  : "border-amber-800/80 bg-amber-950/40 text-amber-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {evaluationResult.passed ? (
                  <CheckCircle2 className="h-8 w-8 text-brand-growth shrink-0" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs uppercase font-semibold tracking-wider">
                    {evaluationResult.passed ? "Verified Evidence Passed" : "Action Required"}
                  </div>
                  <div className="text-base font-bold text-text-primary">
                    {evaluationResult.passed
                      ? "Skill Passport Badge Issued"
                      : "Submission fell below 80% passing threshold"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-3xl font-black">
                  {evaluationResult.score}
                  <span className="text-xs font-normal opacity-70">/100</span>
                </div>
              </div>
            </div>

            {/* Rubric Feedback Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                  Evaluator Summary
                </h4>
                <p className="text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-subtle">
                  {evaluationResult.summary}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                  Objective Evidence Cited
                </h4>
                <p className="text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-subtle">
                  {evaluationResult.evidenceFound}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                  Specific Hardening Advice
                </h4>
                <p className="text-text-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-subtle">
                  {evaluationResult.specificImprovements}
                </p>
              </div>

              {evaluationResult.evidenceHash && (
                <div className="space-y-1 pt-2">
                  <h4 className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                    Cryptographic Proof Hash
                  </h4>
                  <div className="p-2 rounded bg-black/50 border border-border-subtle font-mono text-[11px] text-brand-growth break-all select-all">
                    {evaluationResult.evidenceHash}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              {evaluationResult.passed && (
                <Link href="/passport">
                  <Button variant="primary">
                    <Award className="h-4 w-4 mr-1.5" />
                    <span>View in Skill Passport</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
