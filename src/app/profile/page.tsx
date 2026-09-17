"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ShieldCheck, Award, PlusCircle, Trash2, AlertCircle, ArrowRight, CheckCircle2, Star, UserCheck, Link2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [reputation, setReputation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [timezone, setTimezone] = useState("");
  const [availability, setAvailability] = useState(20);
  const [targetAnnualIncome, setTargetAnnualIncome] = useState(0);
  const [isPassportPublic, setIsPassportPublic] = useState(true);
  const [newPortfolio, setNewPortfolio] = useState({ title: "", description: "", liveDemoUrl: "", repositoryUrl: "" });

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const data = await profileRes.json();
          const p = data.profile;
          setProfile(p);
          setFullName(p.fullName || "");
          setHeadline(p.headline || "");
          setBio(p.bio || "");
          setCountryCode(p.countryCode || "");
          setTimezone(p.timezone || "");
          setAvailability(p.availabilityHoursPerWeek || 20);
          setTargetAnnualIncome(p.targetAnnualIncome || 0);
          setIsPassportPublic(p.isPassportPublic !== false);
        }
        const skillsRes = await fetch("/api/skills");
        if (skillsRes.ok) setSkillsCatalog((await skillsRes.json()).skills || []);
        const subsRes = await fetch("/api/submissions");
        if (subsRes.ok) setSubmissions((await subsRes.json()).submissions || []);
        const repRes = await fetch("/api/reputation");
        if (repRes.ok) setReputation((await repRes.json()).reputation);
      } catch (e) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const saveProfile = async () => {
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          headline,
          bio,
          countryCode,
          timezone,
          availabilityHoursPerWeek: availability,
          targetAnnualIncome,
          isPassportPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save profile.");
        return;
      }
      setSaved("Profile saved.");
      setProfile(data.profile);
    } catch (e) {
      setError("Network error while saving profile.");
    }
  };

  const reloadProfile = async () => {
    const res = await fetch("/api/profile");
    if (res.ok) setProfile((await res.json()).profile);
  };

  const addSkill = async (slug: string) => {
    const res = await fetch("/api/profile/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillSlug: slug }),
    });
    if (res.ok) await reloadProfile();
    else {
      const data = await res.json();
      setError(data.error || "Could not add skill.");
    }
  };

  const removeSkill = async (slug: string) => {
    const res = await fetch(`/api/profile/skills/${slug}`, { method: "DELETE" });
    if (res.ok) await reloadProfile();
    else {
      const data = await res.json();
      setError(data.error || "Could not remove skill.");
    }
  };

  const addPortfolio = async () => {
    if (newPortfolio.title.trim().length < 3) return;
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newPortfolio.title,
        description: newPortfolio.description,
        liveDemoUrl: newPortfolio.liveDemoUrl,
        repositoryUrl: newPortfolio.repositoryUrl,
      }),
    });
    if (res.ok) {
      setNewPortfolio({ title: "", description: "", liveDemoUrl: "", repositoryUrl: "" });
      await reloadProfile();
    } else {
      const data = await res.json();
      setError(data.error || "Could not add portfolio entry.");
    }
  };

  const removePortfolio = async (id: string) => {
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) await reloadProfile();
    else {
      const data = await res.json();
      setError(data.error || "Could not remove portfolio entry.");
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-text-secondary text-sm">Loading your profile…</div>;
  }

  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Sign in to view your profile</h1>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  const skills = profile.skills || [];
  const portfolioItems = profile.portfolioItems || [];
  const rep = reputation || { score: Number(profile.reputationScore) || 100, breakdown: [] };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {error && (
        <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {saved && (
        <div className="p-3 rounded-lg border border-emerald-800/60 bg-emerald-950/30 text-emerald-300 text-xs flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{saved}</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-growth">
          <UserCheck className="h-4 w-4" />
          <span>Profile & Identity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Your Professional Profile</h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-3xl">
          This profile powers your career recommendations, Skill Passport and marketplace applications.
        </p>
      </div>

      {/* Edit profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Profile details</CardTitle>
          <CardDescription className="text-xs">Changes are saved to PostgreSQL.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Cloud Systems Associate" />
          <Input label="Country Code (ISO)" value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} maxLength={2} />
          <Input label="Timezone (IANA)" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. Africa/Lagos" />
          <Input label="Availability (hours / week)" type="number" min={1} max={80} value={String(availability)} onChange={(e) => setAvailability(Number(e.target.value))} />
          <Input label="Target Annual Income (USD)" type="number" min={0} value={String(targetAnnualIncome)} onChange={(e) => setTargetAnnualIncome(Number(e.target.value))} />
          <Textarea label="Bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          <div className="rounded-lg border border-border-subtle bg-surface-subtle p-3 text-xs space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 accent-emerald-500" checked={isPassportPublic} onChange={(e) => setIsPassportPublic(e.target.checked)} />
              <span>Make my Skill Passport public</span>
            </label>
            <p className="text-text-secondary">Public passports are shareable and show only verified skills and portfolio work.</p>
          </div>
        </CardContent>
        <CardContent className="pt-3">
          <Button onClick={saveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      {/* Skills */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Your Skills</h2>
          <p className="text-xs text-text-secondary mt-1">
            Self-reported skills are clearly labeled. Verified skills carry graded evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s: any) => (
            <div key={s.slug} className="rounded-xl border border-border-subtle bg-surface p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant={s.tier === "SELF_REPORTED" ? "warning" : "growth"} className="text-[10px]">
                    {s.tier}
                  </Badge>
                  {s.tier === "SELF_REPORTED" ? (
                    <button
                      onClick={() => removeSkill(s.slug)}
                      className="text-[11px] text-rose-400 hover:underline"
                      aria-label={`Remove ${s.name}`}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <h4 className="text-sm font-bold text-text-primary pt-1">{s.name}</h4>
                <p className="text-xs text-text-secondary line-clamp-2">{s.category}</p>
              </div>
              {s.tier !== "SELF_REPORTED" ? (
                <div className="text-[11px] text-emerald-400 font-medium">
                  Verified {s.confidenceScore > 0 ? `· ${s.confidenceScore}/100` : ""}
                </div>
              ) : (
                <div className="text-[11px] text-amber-400/80">Take a practical challenge to verify this skill.</div>
              )}
            </div>
          ))}
        </div>

        {skills.length === 0 && (
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary">
            No skills yet. Add skills below or complete onboarding diagnostics.
          </div>
        )}

        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h3 className="text-sm font-bold text-text-primary">Add a self-reported skill</h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {skillsCatalog
              .filter((c: any) => !skills.some((mine: any) => mine.slug === c.slug))
              .slice(0, 30)
              .map((c: any) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => addSkill(c.slug)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border-subtle bg-surface-subtle text-text-secondary hover:border-brand-growth hover:text-text-primary"
                >
                  + {c.name}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Portfolio & Evidence</h2>
          <p className="text-xs text-text-secondary mt-1">
            Challenge passes are added automatically with a verified badge. Add self-published work below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolioItems.map((item: any) => (
            <Card key={item.id} className="border-border-subtle bg-surface">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={item.verifiedBadge ? "growth" : "neutral"} className="text-[10px]">
                    {item.verifiedBadge ? "Verified Evidence" : "Self-Published"}
                  </Badge>
                  {!item.verifiedBadge ? (
                    <button
                      onClick={() => removePortfolio(item.id)}
                      className="text-[11px] text-rose-400 hover:underline"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  ) : null}
                </div>
                <h4 className="text-sm font-bold text-text-primary">{item.title}</h4>
                <p className="text-xs text-text-secondary line-clamp-3">{item.description}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  {item.liveDemoUrl ? (
                    <a className="text-brand-growth hover:underline flex items-center gap-1" href={item.liveDemoUrl} target="_blank" rel="noreferrer">
                      <Link2 className="h-3 w-3" /> Demo
                    </a>
                  ) : null}
                  {item.repositoryUrl ? (
                    <a className="text-brand-growth hover:underline flex items-center gap-1" href={item.repositoryUrl} target="_blank" rel="noreferrer">
                      <Link2 className="h-3 w-3" /> Repo
                    </a>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Add portfolio entry
            </CardTitle>
            <CardDescription className="text-xs">Self-published entries are clearly marked and never auto-verified.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Project Title" value={newPortfolio.title} onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })} required />
            <Input label="Live Demo URL" value={newPortfolio.liveDemoUrl} onChange={(e) => setNewPortfolio({ ...newPortfolio, liveDemoUrl: e.target.value })} placeholder="https://…" />
            <Textarea label="Description" rows={3} value={newPortfolio.description} onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })} />
            <Input label="Repository URL" value={newPortfolio.repositoryUrl} onChange={(e) => setNewPortfolio({ ...newPortfolio, repositoryUrl: e.target.value })} placeholder="https://…" />
          </CardContent>
          <CardContent className="pt-3">
            <Button onClick={addPortfolio} variant="primary">Add Entry</Button>
          </CardContent>
        </Card>
      </div>

      {/* Submissions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Challenge Submissions</h2>
          <p className="text-xs text-text-secondary mt-1">Every submission is stored with its rubric evaluation.</p>
        </div>
        {submissions.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-5 text-sm text-text-secondary">
            No challenge submissions yet.{" "}
            <Link href="/learn" className="text-brand-growth hover:underline">Explore practical challenges.</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s: any) => (
              <div key={s.id} className="rounded-xl border border-border-subtle bg-surface p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-text-primary">{s.challengeTitle}</div>
                  <div className="text-[11px] text-text-secondary">
                    {s.skillName} · Attempt {s.attemptNumber} · {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={s.status === "PASSED" ? "growth" : s.status === "REJECTED" ? "risk" : "warning"} className="text-[10px]">
                    {s.status} {s.evaluationScore !== null ? `· ${s.evaluationScore}/100` : ""}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reputation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-growth" /> Reputation Integrity
          </CardTitle>
          <CardDescription className="text-xs">Calculated from real platform activity only — fully explainable.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
            <div className="text-[11px] text-text-secondary uppercase">Reputation Score</div>
            <div className="text-2xl font-black text-text-primary mt-1">{Number(rep.score).toFixed(1)}</div>
            <div className="text-[11px] text-brand-growth">{rep.band || "Active member"}</div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
            <div className="text-[11px] text-text-secondary uppercase">Verified Skills</div>
            <div className="flex items-center gap-1 text-xl font-bold text-text-primary">
              <Award className="h-4 w-4 text-emerald-400" /> {profile.verifiedSkillsCount}
            </div>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
            <div className="text-[11px] text-text-secondary uppercase">Completed Projects</div>
            <div className="flex items-center gap-1 text-xl font-bold text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {profile.completedProjectsCount}
            </div>
          </div>
        </CardContent>
        {rep.breakdown && rep.breakdown.length > 0 ? (
          <CardContent className="space-y-1.5 pt-4 text-xs">
            {(rep.breakdown as string[]).map((line: string) => (
              <div key={line} className="flex items-center gap-1.5 text-text-secondary">
                <Star className="h-3 w-3 text-emerald-400" />
                <span>{line}</span>
              </div>
            ))}
          </CardContent>
        ) : null}
        <CardContent className="pt-3">
          <Link href="/passport">
            <Button variant="secondary">
              View Public Skill Passport <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}