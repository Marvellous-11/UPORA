"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  calculateCareerMatches,
  FOUNDATIONAL_CAREER_PATHS,
  CareerMatchResult,
} from "@/lib/career/recommendation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Shield,
  Code2,
  Cloud,
  BarChart3,
  TrendingUp,
  Target,
  GraduationCap,
  Clock,
  Compass,
  AlertCircle,
  Briefcase,
} from "lucide-react";

const GOAL_OPTIONS = [
  {
    id: "first_job",
    title: "Get my first technology job",
    description: "Break into the global digital economy from scratch.",
    icon: Briefcase,
  },
  {
    id: "earn_while_learning",
    title: "Earn income while learning",
    description: "Qualify for micro-tasks as soon as initial skills are verified.",
    icon: TrendingUp,
  },
  {
    id: "career_transition",
    title: "Transition into a higher-paying career",
    description: "Pivot current experience into high-demand cloud or software roles.",
    icon: Compass,
  },
  {
    id: "build_portfolio",
    title: "Build practical, verifiable proof of work",
    description: "Move beyond course certificates to production-grade deliverables.",
    icon: Code2,
  },
  {
    id: "freelance_work",
    title: "Freelance and take on client contracts",
    description: "Provide verified technical services to global clients.",
    icon: Target,
  },
];

const EXPERIENCE_OPTIONS = [
  {
    id: "BEGINNER",
    label: "Complete Beginner",
    desc: "No prior technical or coding experience. Starting fresh.",
  },
  {
    id: "BASIC",
    label: "Basic Knowledge",
    desc: "Have explored tutorials, basic terminal or scripting syntax.",
  },
  {
    id: "INTERMEDIATE",
    label: "Intermediate Practitioner",
    desc: "Have built personal projects and worked with databases or code.",
  },
  {
    id: "ADVANCED",
    label: "Professional / Advanced",
    desc: "Experienced with production environments, systems, or client work.",
  },
];

const EDUCATION_OPTIONS = [
  "High School / Secondary",
  "Vocational / Technical Diploma",
  "University Degree (STEM)",
  "University Degree (Non-STEM)",
  "Self-Taught / Open Source Contributor",
];

const INTEREST_DOMAINS = [
  {
    id: "Cybersecurity & Systems",
    label: "Cybersecurity & Systems Defense",
    icon: Shield,
    desc: "Server triage, network telemetry, vulnerability patching.",
  },
  {
    id: "Software Development",
    label: "Full-Stack Software Engineering",
    icon: Code2,
    desc: "TypeScript, React, RESTful APIs, database design.",
  },
  {
    id: "Cloud & DevOps",
    label: "Cloud & Infrastructure DevOps",
    icon: Cloud,
    desc: "Docker containers, automated deployment, Linux servers.",
  },
  {
    id: "Data Operations",
    label: "Data Analytics & SQL Modeling",
    icon: BarChart3,
    desc: "Relational queries, cohort analysis, executive dashboards.",
  },
  {
    id: "Growth & Marketing",
    label: "Technical Growth & SEO",
    icon: TrendingUp,
    desc: "Funnel instrumentation, search optimization, retention.",
  },
];

const AVAILABLE_SKILLS = [
  { slug: "linux-systems-admin", name: "Linux Systems Administration", category: "Systems" },
  { slug: "incident-triage-soc", name: "Incident Triage & SOC Reporting", category: "Security" },
  { slug: "typescript-fullstack", name: "TypeScript & Node.js", category: "Software" },
  { slug: "react-frontend-ui", name: "Modern React & UI Architecture", category: "Frontend" },
  { slug: "sql-data-modeling", name: "SQL Data Modeling & Querying", category: "Data" },
  { slug: "docker-containerization", name: "Docker & Containers", category: "DevOps" },
  { slug: "python-data-analytics", name: "Python Data Analysis & Pandas", category: "Data" },
  { slug: "digital-growth-analytics", name: "Conversion Analytics & SEO", category: "Growth" },
];

const TIME_COMMITMENT_OPTIONS = [
  { hours: 10, label: "5 - 10 hours / week", sub: "Casual pace alongside full-time work" },
  { hours: 20, label: "15 - 20 hours / week", sub: "Recommended steady progression pace" },
  { hours: 35, label: "30 - 40 hours / week", sub: "Full-time intensive acceleration" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [primaryGoal, setPrimaryGoal] = useState("first_job");
  const [experienceLevel, setExperienceLevel] = useState("BEGINNER");
  const [educationLevel, setEducationLevel] = useState("Self-Taught / Open Source Contributor");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Software Development",
    "Cloud & DevOps",
  ]);
  const [selectedSkillSlugs, setSelectedSkillSlugs] = useState<string[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [workPreference, setWorkPreference] = useState("Remote freelance micro-contracts");
  const [chosenCareerSlug, setChosenCareerSlug] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completionResult, setCompletionResult] = useState<{
    targetCareer: string;
    matches: CareerMatchResult[];
    roadmap: any;
  } | null>(null);

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/onboarding");
    }
  }, [authLoading, user, router]);

  // Load existing onboarding progress if any
  useEffect(() => {
    if (!user) return;
    async function loadProgress() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.onboarding) {
            const ob = data.onboarding;
            if (ob.onboardingStep && ob.onboardingStep < 6) {
              setStep(ob.onboardingStep);
            }
            if (ob.primaryGoal) setPrimaryGoal(ob.primaryGoal);
            if (ob.experienceLevel) setExperienceLevel(ob.experienceLevel);
            if (ob.educationLevel) setEducationLevel(ob.educationLevel);
            if (ob.interests && ob.interests.length > 0) setSelectedInterests(ob.interests);
            if (ob.skills && ob.skills.length > 0) {
              setSelectedSkillSlugs(ob.skills.map((s: any) => s.slug));
            }
            if (ob.availabilityHoursPerWeek) setHoursPerWeek(ob.availabilityHoursPerWeek);
            if (ob.workPreference) setWorkPreference(ob.workPreference);
          }
        }
      } catch (e) {
        // Continue with default state
      }
    }
    loadProgress();
  }, [user]);

  // Dynamic live career matches
  const careerMatches = useMemo(() => {
    return calculateCareerMatches({
      primaryGoal,
      experienceLevel,
      interests: selectedInterests,
      selfReportedSkillSlugs: selectedSkillSlugs,
      availabilityHoursPerWeek: hoursPerWeek,
    });
  }, [primaryGoal, experienceLevel, selectedInterests, selectedSkillSlugs, hoursPerWeek]);

  const topMatch = careerMatches[0];

  const handleNext = async () => {
    setErrorMsg("");
    // Save intermediate step to server
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: Math.min(6, step + 1),
          primaryGoal,
          experienceLevel,
          educationLevel,
          interests: selectedInterests,
          availabilityHoursPerWeek: hoursPerWeek,
          workPreference,
          skillSlugs: selectedSkillSlugs,
        }),
      });
    } catch (e) {
      // Non-blocking save
    }

    if (step < 6) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const finalCareerSlug = chosenCareerSlug || topMatch?.careerPath.slug || "cloud-security";
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGoal,
          experienceLevel,
          educationLevel,
          interests: selectedInterests,
          availabilityHoursPerWeek: hoursPerWeek,
          workPreference,
          skillSlugs: selectedSkillSlugs,
          chosenCareerSlug: finalCareerSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to finalize onboarding.");
      }

      setCompletionResult({
        targetCareer: data.targetCareer,
        matches: data.matches || careerMatches,
        roadmap: data.roadmap,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying credentials...</span>
        </div>
      </div>
    );
  }

  // Completion Success Screen
  if (completionResult) {
    const selectedCareer =
      FOUNDATIONAL_CAREER_PATHS.find((c) => c.slug === completionResult.targetCareer) ||
      FOUNDATIONAL_CAREER_PATHS[0];

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Badge variant="growth">Plan Established</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Your Career Opportunity Plan is Active
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              We generated a structured 5-phase roadmap specifically tailored to your target milestone and availability.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Target Trajectory
                </span>
                <h3 className="text-lg font-bold text-white">{selectedCareer.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedCareer.description}</p>
              </div>
              <Badge variant="focus">~${selectedCareer.averageGlobalSalaryUSD.toLocaleString()}/yr</Badge>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Your 5 Sequential Phases:</div>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Foundation: Core Theory & Prerequisites (Available Now)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Practical Sandbox: Scenario Simulation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Verified Competency Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>Production Portfolio Artifact</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">5</span>
                  <span>Live Client Tasks & Global Apprenticeships</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            variant="primary"
            onClick={() => router.push("/")}
          >
            Launch My Opportunity Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header & Progress */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-widest text-emerald-400 text-lg">UPORA</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-400 uppercase">Career Diagnostic</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono">
              Step <span className="text-emerald-400 font-bold">{step}</span> of 6
            </span>
            <button
              onClick={() => router.push("/")}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Save & Exit
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="max-w-4xl mx-auto mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Wizard Form Body */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: PRIMARY GOAL */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Step 1: Your Goal</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                What would you like UPORA to help you achieve?
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                This shapes your roadmap milestones and prioritizing whether you need quick micro-earnings or deep technical specialization.
              </p>
            </div>

            <div className="space-y-3">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = primaryGoal === g.id;
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPrimaryGoal(g.id)}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all flex items-start gap-4 ${
                      isSelected
                        ? "bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-base">{g.title}</div>
                      <div className="text-xs sm:text-sm text-slate-400 mt-0.5">{g.description}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE & BACKGROUND */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Step 2: Starting Point</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Where are you starting from today?
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                UPORA is built for all levels. Honesty here ensures your recommendations have manageable learning curves.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Technical Experience Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERIENCE_OPTIONS.map((exp) => {
                  const isSelected = experienceLevel === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExperienceLevel(exp.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="font-semibold text-white text-sm">{exp.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{exp.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Education Background
              </label>
              <div className="grid grid-cols-1 gap-2">
                {EDUCATION_OPTIONS.map((edu) => {
                  const isSelected = educationLevel === edu;
                  return (
                    <button
                      key={edu}
                      type="button"
                      onClick={() => setEducationLevel(edu)}
                      className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-emerald-950/30 border-emerald-500 text-emerald-300"
                          : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {edu}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: INTEREST DOMAINS */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Step 3: Interests</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Which fields interest you most?
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Select one or more domains. We calculate your career path alignment based on labor market weights.
              </p>
            </div>

            <div className="space-y-3">
              {INTEREST_DOMAINS.map((domain) => {
                const isSelected = selectedInterests.includes(domain.id);
                const Icon = domain.icon;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedInterests(selectedInterests.filter((i) => i !== domain.id));
                      } else {
                        setSelectedInterests([...selectedInterests, domain.id]);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      isSelected
                        ? "bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{domain.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{domain.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500 text-slate-950"
                          : "border-slate-700 bg-slate-800"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: SELF-REPORTED SKILLS */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Step 4: Current Skills</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Do you already possess any of these skills?
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Select any skills you have worked with. If you are starting fresh, simply click &quot;Continue&quot;.
              </p>
            </div>

            {/* Crucial Self-Reported vs Verified Disclaimer */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs flex items-start gap-3">
              <Shield className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
              <div>
                <span className="font-semibold block text-blue-200">Trust & Verification Policy</span>
                Skills selected here are recorded as <span className="font-mono font-bold text-blue-300">SELF_REPORTED</span>. They give you a head-start on prerequisites, but only completed practical challenges grant full <span className="font-mono font-bold text-blue-300">PROJECT_VERIFIED</span> status.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = selectedSkillSlugs.includes(skill.slug);
                return (
                  <button
                    key={skill.slug}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSkillSlugs(selectedSkillSlugs.filter((s) => s !== skill.slug));
                      } else {
                        setSelectedSkillSlugs([...selectedSkillSlugs, skill.slug]);
                      }
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white text-sm">{skill.name}</div>
                      <Badge variant="neutral" className="mt-1.5 text-[10px]">
                        {skill.category}
                      </Badge>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500 text-slate-950"
                          : "border-slate-700 bg-slate-800"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: TIME & WORK PREFERENCES */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Step 5: Capacity & Pace</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                How much time can you invest weekly?
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                We calculate realistic milestone timelines and work suitability from your available hours.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Weekly Hours Commitment
              </label>
              <div className="space-y-3">
                {TIME_COMMITMENT_OPTIONS.map((opt) => {
                  const isSelected = hoursPerWeek === opt.hours;
                  return (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setHoursPerWeek(opt.hours)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/50"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white text-sm">{opt.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{opt.sub}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Work Format Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Remote freelance micro-contracts",
                  "Full-time remote engineering",
                  "Fellowships & apprenticeships",
                  "Open to any verified opportunity",
                ].map((pref) => {
                  const isSelected = workPreference === pref;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setWorkPreference(pref)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-emerald-950/30 border-emerald-500 text-emerald-300"
                          : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: CAREER RECOMMENDATION & ROADMAP LAUNCH */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Step 6: Opportunity Match</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Recommended Opportunity Trajectory
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Based on your diagnostic profile, our deterministic matching algorithm selected your highest-probability career path.
              </p>
            </div>

            {/* Top Match Highlight Card */}
            {topMatch && (
              <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="growth" className="text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {topMatch.matchScore}% Compatibility Match
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    Est. ${topMatch.careerPath.averageGlobalSalaryUSD.toLocaleString()} / year
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{topMatch.careerPath.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">{topMatch.careerPath.description}</p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-emerald-400 block mb-0.5">Transparent Rationale:</span>
                  {topMatch.rationale}
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Prerequisite Skill Demands:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {topMatch.careerPath.requiredSkills.map((req) => {
                      const userHas = selectedSkillSlugs.includes(req.slug);
                      return (
                        <span
                          key={req.slug}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            userHas
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                              : "bg-slate-800/80 text-slate-400 border-slate-700"
                          }`}
                        >
                          {req.name} {userHas ? "✓ (Self-Reported)" : "(Needed)"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Alternative Career Paths */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Or Select an Alternative Path:
              </span>
              <div className="space-y-2">
                {careerMatches.slice(1, 4).map((cm) => {
                  const isChosen = chosenCareerSlug === cm.careerPath.slug;
                  return (
                    <button
                      key={cm.careerPath.slug}
                      type="button"
                      onClick={() => setChosenCareerSlug(cm.careerPath.slug)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isChosen
                          ? "bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white text-sm">{cm.careerPath.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {cm.matchScore}% Match • {cm.careerPath.category}
                        </div>
                      </div>
                      <Badge variant="neutral">Select</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur sticky bottom-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              isLoading={isSubmitting}
              onClick={handleComplete}
            >
              Generate My Personalized Career Plan
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
