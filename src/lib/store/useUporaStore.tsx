"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  NextAction,
  SkillItem,
  CareerPathOption,
  PracticalChallenge,
  MarketplaceTask,
  OpportunityItem,
  FinancialState,
  initialProfile,
  initialNextActions,
  initialSkills,
  initialCareerPaths,
  initialPracticalChallenges,
  initialMarketplaceTasks,
  initialOpportunities,
  initialFinancials,
} from "../data/initialData";

export interface EvaluationResult {
  passed: boolean;
  score: number;
  summary: string;
  evidenceFound: string;
  specificImprovements: string;
  verifiedSkillName?: string;
  evidenceHash?: string;
}

interface UporaStoreContextType {
  profile: UserProfile;
  nextActions: NextAction[];
  skills: SkillItem[];
  careerPaths: CareerPathOption[];
  selectedCareerPath: CareerPathOption;
  challenges: PracticalChallenge[];
  marketplaceTasks: MarketplaceTask[];
  opportunities: OpportunityItem[];
  financials: FinancialState;
  selectCareerPath: (pathId: string) => void;
  evaluateChallengeSubmission: (
    challengeId: string,
    submissionText: string
  ) => Promise<EvaluationResult>;
  applyForTask: (taskId: string, pitch: string) => void;
  submitAndCompleteTaskMilestone: (taskId: string) => void;
  logFinancialSaving: (amount: number) => void;
}

const UporaStoreContext = createContext<UporaStoreContextType | undefined>(
  undefined
);

export function UporaStoreProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [nextActions, setNextActions] = useState<NextAction[]>(initialNextActions);
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
  const [careerPaths] = useState<CareerPathOption[]>(initialCareerPaths);
  const [selectedCareerPath, setSelectedCareerPath] = useState<CareerPathOption>(
    initialCareerPaths[0]
  );
  const [challenges] = useState<PracticalChallenge[]>(
    initialPracticalChallenges
  );
  const [marketplaceTasks, setMarketplaceTasks] =
    useState<MarketplaceTask[]>(initialMarketplaceTasks);
  const [opportunities] =
    useState<OpportunityItem[]>(initialOpportunities);
  const [financials, setFinancials] =
    useState<FinancialState>(initialFinancials);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("upora_profile");
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      const savedSkills = localStorage.getItem("upora_skills");
      if (savedSkills) setSkills(JSON.parse(savedSkills));
      const savedFinancials = localStorage.getItem("upora_financials");
      if (savedFinancials) setFinancials(JSON.parse(savedFinancials));
    } catch (e) {
      console.warn("Storage hydration bypassed", e);
    }
  }, []);

  const selectCareerPath = (pathId: string) => {
    const found = careerPaths.find((cp) => cp.id === pathId);
    if (found) {
      setSelectedCareerPath(found);
      setProfile((prev) => ({
        ...prev,
        targetRole: found.title,
      }));
    }
  };

  const evaluateChallengeSubmission = async (
    challengeId: string,
    submissionText: string
  ): Promise<EvaluationResult> => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    // Realistic evaluation simulation based on rubric criteria
    // Checks for keyword evidence and depth
    const lower = submissionText.toLowerCase();
    const hasCidr = lower.includes("198.51.100.0/24") || lower.includes("198.51.100");
    const hasIptablesOrWaf = lower.includes("iptables") || lower.includes("waf") || lower.includes("drop") || lower.includes("block");
    const hasBruteForce = lower.includes("brute") || lower.includes("dictionary") || lower.includes("credential");
    const hasRecommendations = lower.includes("mfa") || lower.includes("rate limit") || lower.includes("hardening") || lower.includes("fail2ban");

    let score = 55;
    if (hasCidr) score += 15;
    if (hasIptablesOrWaf) score += 15;
    if (hasBruteForce) score += 10;
    if (hasRecommendations) score += 10;
    if (submissionText.length > 350) score += 4;

    const passed = score >= challenge.passingScore;
    const evidenceHash = "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const result: EvaluationResult = {
      passed,
      score,
      summary: passed
        ? "Excellent practical work. The report properly diagnoses the coordinated attack signature, isolates the /24 ingress block, and articulates a syntactically sound mitigation."
        : "The submission requires refinement. While you noticed anomalous logins, you missed isolating the specific /24 subnet or did not provide a production firewall rule.",
      evidenceFound: hasCidr
        ? "Explicit isolation of offending subnet 198.51.100.0/24 with timestamp correlation."
        : "General mention of IP addresses without subnet aggregation.",
      specificImprovements: passed
        ? "Consider adding an automated rate-limiting rule (e.g. 5 req/min per IP) in addition to the outright CIDR block."
        : "Specify the exact iptables command (`iptables -A INPUT -s 198.51.100.0/24 -j DROP`) and detail fail2ban configuration.",
      verifiedSkillName: challenge.category,
      evidenceHash,
    };

    if (passed) {
      // Add or upgrade skill in Skill Passport
      const skillName = "Production Incident Triage & Perimeter Defense";
      const newSkill: SkillItem = {
        id: `skl-new-${Date.now()}`,
        name: skillName,
        category: challenge.category,
        difficulty: "INTERMEDIATE",
        tier: "PROJECT_VERIFIED",
        score,
        verifiedAt: new Date().toISOString().split("T")[0],
        evidenceHash,
        evidenceTitle: challenge.title,
      };

      const updatedSkills = [newSkill, ...skills.filter((s) => s.name !== skillName)];
      setSkills(updatedSkills);
      localStorage.setItem("upora_skills", JSON.stringify(updatedSkills));

      // Update profile metrics
      setProfile((prev) => {
        const updated = {
          ...prev,
          verifiedSkillsCount: prev.verifiedSkillsCount + 1,
          completedTasksCount: prev.completedTasksCount + 1,
          reputationScore: Math.min(100, prev.reputationScore + 0.6),
        };
        localStorage.setItem("upora_profile", JSON.stringify(updated));
        return updated;
      });

      // Update next actions
      setNextActions((prev) =>
        prev.map((act) =>
          act.id === "act-1"
            ? {
                ...act,
                title: "Tier 2 Cloud Support Work Unlocked!",
                description: "You passed the Incident Triage challenge. Apply to the $140 CloudOps Global task.",
                actionLabel: "View Available Work",
                actionHref: "/work",
                rewardOrImpact: "Tier 2 Unlocked",
              }
            : act
        )
      );
    }

    return result;
  };

  const applyForTask = (taskId: string, pitch: string) => {
    setMarketplaceTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              applicantCount: task.applicantCount + 1,
            }
          : task
      )
    );
  };

  const submitAndCompleteTaskMilestone = (taskId: string) => {
    const task = marketplaceTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Mark task as completed
    setMarketplaceTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "COMPLETED" } : t))
    );

    // Release escrow to wallet
    setFinancials((prev) => {
      const payout = task.budgetUSD;
      const updated: FinancialState = {
        ...prev,
        availableBalanceUSD: prev.availableBalanceUSD + payout,
        incomeThisMonth: prev.incomeThisMonth + payout,
        lifetimeEarningsUSD: prev.lifetimeEarningsUSD + payout,
        recentTransactions: [
          {
            id: `tx-${Date.now()}`,
            title: `Escrow Released: ${task.clientName} - ${task.title}`,
            amount: payout,
            type: "CREDIT",
            date: new Date().toISOString().split("T")[0],
            status: "CLEARED",
          },
          ...prev.recentTransactions,
        ],
      };
      localStorage.setItem("upora_financials", JSON.stringify(updated));
      return updated;
    });

    // Update profile
    setProfile((prev) => {
      const updated = {
        ...prev,
        reputationScore: Math.min(100, prev.reputationScore + 0.3),
        completedTasksCount: prev.completedTasksCount + 1,
      };
      localStorage.setItem("upora_profile", JSON.stringify(updated));
      return updated;
    });
  };

  const logFinancialSaving = (amount: number) => {
    setFinancials((prev) => {
      const updated: FinancialState = {
        ...prev,
        savedThisMonth: prev.savedThisMonth + amount,
        currentGoalSavedUSD: Math.min(
          prev.currentGoalTargetUSD,
          prev.currentGoalSavedUSD + amount
        ),
      };
      localStorage.setItem("upora_financials", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UporaStoreContext.Provider
      value={{
        profile,
        nextActions,
        skills,
        careerPaths,
        selectedCareerPath,
        challenges,
        marketplaceTasks,
        opportunities,
        financials,
        selectCareerPath,
        evaluateChallengeSubmission,
        applyForTask,
        submitAndCompleteTaskMilestone,
        logFinancialSaving,
      }}
    >
      {children}
    </UporaStoreContext.Provider>
  );
}

export function useUpora() {
  const context = useContext(UporaStoreContext);
  if (!context) {
    throw new Error("useUpora must be used within a UporaStoreProvider");
  }
  return context;
}
