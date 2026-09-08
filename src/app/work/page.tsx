"use client";

import { useState } from "react";
import { useUpora } from "@/lib/store/useUporaStore";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  DollarSign,
  Send,
  Check,
  PlusCircle,
} from "lucide-react";

export default function MarketplaceWorkPage() {
  const {
    marketplaceTasks,
    skills,
    applyForTask,
    submitAndCompleteTaskMilestone,
    financials,
  } = useUpora();

  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedTask, setSelectedTask] = useState<(typeof marketplaceTasks)[0] | null>(null);
  const [proposalPitch, setProposalPitch] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  // New Client Task Form state
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState("150");
  const [newDesc, setNewDesc] = useState("");
  const [newTier, setNewTier] = useState<"FOUNDATIONAL" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");

  const filteredTasks = marketplaceTasks.filter((task) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "FOUNDATIONAL") return task.tier === "FOUNDATIONAL";
    if (activeTab === "INTERMEDIATE") return task.tier === "INTERMEDIATE";
    if (activeTab === "ADVANCED") return task.tier === "ADVANCED";
    return true;
  });

  const handleOpenApply = (task: (typeof marketplaceTasks)[0]) => {
    setSelectedTask(task);
    setProposalPitch(
      `Hello ${task.clientName},\n\nI reviewed your requirements for ${task.title}. My verified Skill Passport includes demonstrated evidence in ${task.requiredSkills.join(", ")} with top-tier rubric scores.\n\nI can deliver all scoped milestones on time with complete documentation.`
    );
    setShowApplyModal(true);
  };

  const handleConfirmApply = () => {
    if (!selectedTask) return;
    setIsApplying(true);
    setTimeout(() => {
      applyForTask(selectedTask.id, proposalPitch);
      setIsApplying(false);
      setShowApplyModal(false);
    }, 600);
  };

  const handleSimulateApproval = (taskId: string) => {
    submitAndCompleteTaskMilestone(taskId);
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Verified Work. Guaranteed Escrow.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl">
            Clients fund milestone escrows before work starts. Talent unlocks opportunities strictly through demonstrated, verified skill evidence.
          </p>
        </div>

        <Button onClick={() => setShowPostModal(true)} variant="outline">
          <PlusCircle className="h-4 w-4 mr-1.5" />
          <span>Post Client Task</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs
        tabs={[
          { id: "ALL", label: "All Tasks", count: marketplaceTasks.length },
          {
            id: "FOUNDATIONAL",
            label: "Tier 1: Foundational",
            count: marketplaceTasks.filter((t) => t.tier === "FOUNDATIONAL").length,
          },
          {
            id: "INTERMEDIATE",
            label: "Tier 2: Intermediate",
            count: marketplaceTasks.filter((t) => t.tier === "INTERMEDIATE").length,
          },
          {
            id: "ADVANCED",
            label: "Tier 3: Advanced",
            count: marketplaceTasks.filter((t) => t.tier === "ADVANCED").length,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => {
          // Check if talent meets the required verified skills
          const meetsSkills = task.requiredSkills.every((req) =>
            skills.some((s) => s.name.toLowerCase().includes(req.toLowerCase().split(" ")[0]))
          );
          const isCompleted = task.status === "COMPLETED";

          return (
            <Card
              key={task.id}
              className={`flex flex-col justify-between transition-all ${
                isCompleted
                  ? "border-emerald-800/50 bg-surface-subtle/30"
                  : "border-border-subtle hover:border-border-subtle"
              }`}
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={task.tier === "ADVANCED" ? "focus" : "growth"}>
                    {task.tierLabel}
                  </Badge>
                  <div className="text-right">
                    <div className="font-mono font-bold text-base text-brand-growth">
                      {formatCurrency(task.budgetUSD)}
                    </div>
                    <div className="text-[10px] text-text-secondary">Escrow Funded</div>
                  </div>
                </div>

                <div>
                  <CardTitle className="text-base font-bold text-text-primary leading-snug">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Client: <strong className="text-text-primary">{task.clientName}</strong> ({task.clientRating} ★ · {task.clientCompletedJobs} completed jobs)
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                <p className="text-text-secondary leading-relaxed line-clamp-3">
                  {task.description}
                </p>

                {/* Scoped Deliverables */}
                <div className="space-y-1 rounded-lg border border-border-subtle bg-surface-subtle p-2.5">
                  <div className="font-semibold text-text-primary text-[11px] uppercase tracking-wider">
                    Scoped Deliverables:
                  </div>
                  <ul className="space-y-1 text-text-secondary">
                    {task.deliverables.map((del, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-brand-growth shrink-0 mt-0.5" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Verified Skills */}
                <div className="space-y-1.5">
                  <div className="text-text-secondary font-medium text-[11px]">
                    Required Verified Badges:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {task.requiredSkills.map((req) => (
                      <Badge key={req} variant="neutral" className="text-[10px]">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <div className="text-xs text-text-secondary">
                  {isCompleted ? (
                    <span className="text-brand-growth font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Approved & Paid Out
                    </span>
                  ) : (
                    <span>{task.applicantCount} proposals</span>
                  )}
                </div>

                {isCompleted ? (
                  <Button size="sm" variant="outline" disabled>
                    Milestone Completed
                  </Button>
                ) : meetsSkills ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleOpenApply(task)}>
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSimulateApproval(task.id)}
                      title="Simulate client approving your milestone and releasing escrow funds into your wallet"
                    >
                      Simulate Approval
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" disabled className="gap-1.5">
                    <Lock className="h-3 w-3" />
                    <span>Skill Badge Required</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Application Modal */}
      {selectedTask && (
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title={`Apply for: ${selectedTask.title}`}
          description={`Client: ${selectedTask.clientName} · Budget: ${formatCurrency(selectedTask.budgetUSD)} (Escrow Funded)`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-border-subtle bg-surface-subtle text-xs space-y-1">
              <span className="font-semibold text-text-primary">Verified Evidence Attached:</span>
              <p className="text-brand-growth">
                Your Skill Passport badges and objective challenge scorecards are automatically attached to this application.
              </p>
            </div>

            <Textarea
              label="Proposal & Execution Plan"
              rows={6}
              value={proposalPitch}
              onChange={(e) => setProposalPitch(e.target.value)}
              className="text-xs font-mono"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmApply} isLoading={isApplying}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                <span>Submit Proposal</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Post Client Task Modal */}
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Post a Scoped Client Task"
        description="Define deliverables and fund escrow. Only talent with demonstrated badges can apply."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <Input
            label="Project Title"
            placeholder="e.g. Audit Cloudflare WAF Access Logs"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Budget (USD in Escrow)"
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                Work Tier
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as any)}
                className="flex h-10 w-full rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-text-primary focus:border-brand-focus focus:bg-surface focus:outline-none"
              >
                <option value="FOUNDATIONAL">Tier 1: Foundational ($30-$80)</option>
                <option value="INTERMEDIATE">Tier 2: Intermediate ($100-$250)</option>
                <option value="ADVANCED">Tier 3: Advanced ($250+)</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Deliverable Scope & Brief"
            placeholder="Describe the exact deliverables expected upon milestone completion..."
            rows={4}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />

          <div className="p-3 rounded-lg border border-border-subtle bg-surface-subtle text-text-secondary text-[11px]">
            Notice: Client payments are held in non-custodial milestone escrow via Stripe Connect / Paystack. Funds are only released upon your explicit approval of deliverables.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => setShowPostModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert("Task posted and escrow funding initiated via gateway adapter!");
                setShowPostModal(false);
              }}
            >
              Deposit Escrow & Publish Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
