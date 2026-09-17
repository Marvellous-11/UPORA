"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import {
  Briefcase,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

export default function MarketplaceWorkPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("OPEN");

  const [tasks, setTasks] = useState<any[]>([]);
  const [applications, setApplications] = useState<{ mine: any[]; incoming: any[] }>({ mine: [], incoming: [] });
  const [contracts, setContracts] = useState<any[]>([]);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [proposalPitch, setProposalPitch] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("150");
  const [newDesc, setNewDesc] = useState("");
  const [newTier, setNewTier] = useState<"FOUNDATIONAL" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");
  const [newSkills, setNewSkills] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const [milestoneNote, setMilestoneNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const loadAll = async () => {
    setError(null);
    try {
      const [tasksRes, appsRes, contractsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/applications"),
        fetch("/api/contracts"),
      ]);
      if (tasksRes.ok) setTasks((await tasksRes.json()).tasks || []);
      if (appsRes.ok) setApplications((await appsRes.json()));
      if (contractsRes.ok) setContracts((await contractsRes.json()).contracts || []);
    } catch (e) {
      setError("Unable to load the workplace right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAll();
    else setLoading(false);
  }, [user]);

  const openApply = (task: any) => {
    setSelectedTask(task);
    setProposalPitch(
      `Hello ${task.clientName},\n\nI would like to apply for "${task.title}". My verified Skill Passport includes evidence in: ${task.requiredSkills.join(", ")}.\n\nI can deliver all scoped milestones and will keep you updated on progress.`
    );
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!selectedTask) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalPitch }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Application failed.");
        return;
      }
      setShowApplyModal(false);
      await loadAll();
    } catch (e) {
      setError("Network error while applying.");
    } finally {
      setBusy(false);
    }
  };

  const postTask = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          tier: newTier,
          budgetAmount: Number(newBudget),
          currency: "USD",
          requiredSkills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
          deadline: new Date(newDeadline),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not publish the task.");
        return;
      }
      setShowPostModal(false);
      setNewTitle("");
      setNewBudget("150");
      setNewDesc("");
      setNewSkills("");
      setNewDeadline("");
      await loadAll();
    } catch (e) {
      setError("Network error while posting the task.");
    } finally {
      setBusy(false);
    }
  };

  const reviewApplication = async (taskId: string, applicationId: string, action: "ACCEPT" | "REJECT") => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update the application.");
        return;
      }
      await loadAll();
    } catch (e) {
      setError("Network error while reviewing the application.");
    } finally {
      setBusy(false);
    }
  };

  const milestoneAction = async (contractId: string, milestoneId: string, action: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/milestones/${milestoneId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          deliverableNote: action === "SUBMIT" ? milestoneNote[milestoneId] : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Milestone action failed.");
        return;
      }
      setMilestoneNote((prev) => ({ ...prev, [milestoneId]: "" }));
      await loadAll();
    } catch (e) {
      setError("Network error while processing the milestone.");
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Sign in to access the workplace</h1>
        <p className="text-sm text-text-secondary">Register and complete onboarding to unlock tier-gated tasks.</p>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  const isClient = user.role === "CLIENT" || user.role === "ADMIN";

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-text-secondary">Loading workplace…</div>;
  }

  const tabCounts = {
    OPEN: tasks.filter((t) => t.status === "OPEN_FOR_APPLICATIONS" && !t.isMine).length,
    MINE: applications.mine.length,
    INCOMING: isClient ? applications.incoming.filter((a) => a.status === "PENDING").length : 0,
    CONTRACTS: contracts.filter((c) => c.status !== "COMPLETED").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
            <Briefcase className="h-4 w-4" />
            <span>Work Quality Marketplace & Escrow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Verified Work. Transparent Ledger.</h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl">
            Applications persist in the database. Accepted work creates contracts with milestones settled through the internal ledger until a live payment gateway is connected.
          </p>
        </div>
        {isClient && (
          <Button variant="primary" onClick={() => setShowPostModal(true)}>
            <PlusCircle className="h-4 w-4 mr-1.5" /> Post a Task
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Tabs
        tabs={[
          { id: "OPEN", label: "Open Tasks", count: tabCounts.OPEN },
          { id: "MINE", label: "My Applications", count: tabCounts.MINE },
          ...(isClient ? [{ id: "INCOMING", label: "Review Applicants", count: tabCounts.INCOMING }] : []),
          { id: "CONTRACTS", label: "Contracts & Milestones", count: tabCounts.CONTRACTS },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* OPEN TASKS TAB */}
      {activeTab === "OPEN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.filter((t) => t.status === "OPEN_FOR_APPLICATIONS" && !t.isMine).length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary md:col-span-2">
              No open tasks right now. Verify skills through practical challenges to qualify when tasks appear.
            </div>
          ) : (
            tasks
              .filter((t) => t.status === "OPEN_FOR_APPLICATIONS" && !t.isMine)
              .map((task) => (
                <Card key={task.id} className="border-border-subtle bg-surface hover:border-brand-growth/40 transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="growth" className="text-[10px]">Escrow Protected</Badge>
                      <span className="font-mono font-bold text-brand-growth text-base">
                        {formatCurrency(task.budgetAmount, task.currency)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-sm">{task.title}</h4>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {task.requiredSkills.slice(0, 4).map((s: string) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-subtle border border-border-subtle text-text-secondary">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle/60 text-xs text-text-secondary">
                      <span>Client: {task.clientName}</span>
                      <span>{task.applicantCount} applicant(s)</span>
                    </div>
                    {task.myApplication ? (
                      <Badge variant="warning" className="text-[10px]">Applied · {task.myApplication.status}</Badge>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => openApply(task)}>
                        Apply With Verified Skills <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {/* MY APPLICATIONS TAB */}
      {activeTab === "MINE" && (
        <div className="space-y-3">
          {applications.mine.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary">
              You have not applied to any tasks yet. Applications you submit appear here with their review status.
            </div>
          ) : (
            applications.mine.map((a: any) => (
              <div key={a.id} className="rounded-xl border border-border-subtle bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-text-primary">{a.taskTitle}</div>
                  <div className="text-[11px] text-text-secondary">
                    {formatCurrency(a.proposedAmount, a.currency)} · {a.clientName} · Applied {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 pt-1">{a.proposalPitch}</p>
                </div>
                <Badge
                  variant={a.status === "ACCEPTED" ? "growth" : a.status === "REJECTED" ? "risk" : a.status === "WITHDRAWN" ? "neutral" : "warning"}
                  className="text-[10px] shrink-0"
                >
                  {a.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}

      {/* INCOMING APPLICATIONS TAB (clients only) */}
      {activeTab === "INCOMING" && isClient && (
        <div className="space-y-3">
          {applications.incoming.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary">
              No incoming applications yet. Post a task to start receiving proposals.
            </div>
          ) : (
            applications.incoming.map((a: any) => (
              <div key={a.id} className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-text-primary">{a.talentName}</div>
                    <div className="text-[11px] text-text-secondary">
                      {a.taskTitle} · {formatCurrency(a.proposedAmount, a.currency)} · {a.talentVerifiedSkills} verified skill(s)
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-3 pt-1">{a.proposalPitch}</p>
                  </div>
                  <Badge
                    variant={a.status === "ACCEPTED" ? "growth" : a.status === "REJECTED" ? "risk" : "warning"}
                    className="text-[10px] shrink-0"
                  >
                    {a.status}
                  </Badge>
                </div>
                {a.status === "PENDING" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/60">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={busy}
                      onClick={() => reviewApplication(a.taskId, a.id, "ACCEPT")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept & Create Contract
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => reviewApplication(a.taskId, a.id, "REJECT")}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTRACTS & MILESTONES TAB */}
      {activeTab === "CONTRACTS" && (
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary">
              No active contracts yet. Apply to tasks or accept an applicant to create a contract.
            </div>
          ) : (
            contracts.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-border-subtle bg-surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-text-primary">{c.taskTitle}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">
                      {c.myRole === "TALENT" ? `Client: ${c.clientName}` : `Talent: ${c.talentName}`} · {formatCurrency(c.totalAmount, c.currency)}
                    </div>
                  </div>
                  <Badge
                    variant={c.status === "COMPLETED" ? "growth" : c.status === "ACTIVE" ? "focus" : c.status === "DISPUTED" ? "risk" : "warning"}
                    className="text-[10px] shrink-0"
                  >
                    {c.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {c.milestones.map((m: any) => (
                    <div key={m.id} className="rounded-lg border border-border-subtle bg-surface-subtle p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-primary">{m.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-brand-growth">{formatCurrency(m.amount, c.currency)}</span>
                          <Badge
                            variant={m.status === "PAID_OUT" ? "growth" : m.status === "SUBMITTED" ? "focus" : m.status === "ESCROWED" ? "warning" : "neutral"}
                            className="text-[9px]"
                          >
                            {m.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Client: fund milestone */}
                      {c.myRole === "CLIENT" && m.status === "PENDING_ESCROW" && (
                        <Button size="sm" variant="primary" disabled={busy} onClick={() => milestoneAction(c.id, m.id, "FUND")}>
                          Fund Milestone (Internal Ledger)
                        </Button>
                      )}

                      {/* Talent: submit deliverable */}
                      {c.myRole === "TALENT" && m.status === "ESCROWED" && (
                        <div className="space-y-2">
                          <Textarea
                            label="Deliverable note"
                            rows={3}
                            value={milestoneNote[m.id] || ""}
                            onChange={(e) => setMilestoneNote((prev) => ({ ...prev, [m.id]: e.target.value }))}
                            placeholder="Describe your deliverable…"
                          />
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={busy || !milestoneNote[m.id]?.trim()}
                            onClick={() => milestoneAction(c.id, m.id, "SUBMIT")}
                          >
                            Submit Deliverable
                          </Button>
                        </div>
                      )}

                      {/* Client: approve deliverable */}
                      {c.myRole === "CLIENT" && m.status === "SUBMITTED" && (
                        <div className="space-y-1">
                          {m.deliverableNote && (
                            <p className="text-xs text-text-secondary bg-surface p-2 rounded border border-border-subtle">{m.deliverableNote}</p>
                          )}
                          <Button size="sm" variant="primary" disabled={busy} onClick={() => milestoneAction(c.id, m.id, "APPROVE")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve & Release Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* APPLY MODAL */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply: ${selectedTask?.title || ""}`}
        description="Submit your proposal. Applications are persisted to the database."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <Textarea
            label="Proposal"
            rows={6}
            value={proposalPitch}
            onChange={(e) => setProposalPitch(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
            <Button variant="primary" disabled={busy || proposalPitch.trim().length < 30} onClick={submitApplication}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* POST TASK MODAL (clients only) */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Post a New Task"
        description="Tasks are published to the marketplace and open for applications."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <Input label="Task Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <Textarea label="Description" rows={4} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Budget (USD)" type="number" min={1} value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-primary">Tier</label>
              <select
                className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary"
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as typeof newTier)}
              >
                <option value="FOUNDATIONAL">Foundational</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
          <Input label="Required Skills (comma-separated)" value={newSkills} onChange={(e) => setNewSkills(e.target.value)} placeholder="e.g. Linux, SQL, Python" />
          <Input label="Deadline" type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPostModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={busy || !newTitle.trim() || !newDesc.trim() || !newDeadline}
              onClick={postTask}
            >
              Publish Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
