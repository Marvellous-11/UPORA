"use client";

import { useState } from "react";
import { useUpora } from "@/lib/store/useUporaStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Briefcase,
} from "lucide-react";

export default function CareerNavigatorPage() {
  const { careerPaths, selectedCareerPath, selectCareerPath, skills } = useUpora();
  const [selectedId, setSelectedId] = useState<string>(selectedCareerPath.id);

  const currentPath = careerPaths.find((p) => p.id === selectedId) || careerPaths[0];

  const handleSelectPath = (id: string) => {
    setSelectedId(id);
    selectCareerPath(id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Navigator Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <Compass className="h-4 w-4" />
          <span>AI Career Navigator & Skill Gap Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Career Direction & Competency Mapping
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          We compare your verified evidence against real global employer demand. All salary benchmarks and market fits are estimates based on standardized labor taxonomies, never guaranteed promises.
        </p>
      </div>

      {/* Career Trajectory Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {careerPaths.map((path) => {
          const isSelected = path.id === selectedId;
          const isCurrentActive = path.id === selectedCareerPath.id;

          return (
            <div
              key={path.id}
              onClick={() => handleSelectPath(path.id)}
              className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-brand-growth bg-surface ring-1 ring-brand-growth shadow-lg"
                  : "border-border-subtle bg-surface-subtle/50 hover:bg-surface-subtle hover:border-border-subtle"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={isSelected ? "growth" : "neutral"} className="text-[10px]">
                    {path.matchScore}% Competency Fit
                  </Badge>
                  {isCurrentActive && (
                    <span className="text-[10px] font-semibold text-brand-growth uppercase tracking-wider">
                      Active Target
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-text-primary leading-snug">
                  {path.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                  {path.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border-subtle/60">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Difficulty:</span>
                  <span className="font-medium text-text-primary">{path.entryDifficulty}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Global Salary:</span>
                  <span className="font-mono font-medium text-brand-growth">
                    {path.avgGlobalSalaryUSD}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Inspection for Selected Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fit Analysis & Skill Gap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Why It Fits Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Labor Market & Capability Fit Analysis</CardTitle>
              <CardDescription className="text-xs">
                Objective rationale connecting your demonstrated evidence with industry requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-primary leading-relaxed bg-surface-subtle p-4 rounded-xl border border-border-subtle">
                {currentPath.whyItFits}
              </p>

              {/* Verified vs Missing Skills Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Competency Gap Breakdown
                </h4>
                <div className="space-y-2">
                  {currentPath.skillsRequired.map((skillName) => {
                    const hasSkill = skills.some((s) => s.name.toLowerCase().includes(skillName.toLowerCase().split(" ")[0]));
                    return (
                      <div
                        key={skillName}
                        className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface-subtle/40"
                      >
                        <div className="flex items-center gap-2.5">
                          {hasSkill ? (
                            <CheckCircle2 className="h-4 w-4 text-brand-growth shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                          )}
                          <span className="text-xs sm:text-sm font-medium text-text-primary">
                            {skillName}
                          </span>
                        </div>
                        <Badge variant={hasSkill ? "growth" : "warning"} className="text-[10px]">
                          {hasSkill ? "Demonstrated" : "Skill Gap · Prioritized"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Example Practical Projects to Bridge Gap */}
              <div className="space-y-3 pt-4 border-t border-border-subtle">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Recommended Practical Projects for this Trajectory
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-text-secondary">
                  {currentPath.exampleProjects.map((proj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-brand-growth font-bold">0{i + 1}.</span>
                      <span className="text-text-primary">{proj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Transparent Risks & Disclaimers */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="h-4 w-4" />
                <CardTitle className="text-base font-bold text-text-primary">
                  Market Realities & Risks
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                We do not sell illusions. Understand the real challenges of this role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
              <p className="p-3.5 rounded-lg border border-amber-800/40 bg-amber-950/20 text-amber-200/90">
                {currentPath.marketRisks}
              </p>

              <div className="space-y-2 pt-2">
                <h5 className="font-semibold text-text-primary text-xs uppercase tracking-wider">
                  Important Ethical Principle:
                </h5>
                <p className="text-xs text-text-secondary">
                  UPORA does not guarantee employment, client contracts, or specific dollar outcomes. Our engine assists your direction, but true economic mobility comes from completing practical challenges and earning client trust through verified execution.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSelectPath(currentPath.id)}
                  className="w-full"
                  variant={currentPath.id === selectedCareerPath.id ? "secondary" : "primary"}
                >
                  {currentPath.id === selectedCareerPath.id
                    ? "Current Active Roadmap"
                    : "Set As My Primary Target"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
