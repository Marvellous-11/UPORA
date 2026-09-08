"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlobalRole } from "@prisma/client";
import { ArrowRight, UserCheck, Briefcase, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<GlobalRole>(GlobalRole.WORKER);
  const [countryCode, setCountryCode] = useState("NG");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await register({
        fullName,
        email,
        password,
        role,
        countryCode,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });

      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "Registration failed. Please review your input.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-14 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl tracking-tight text-text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-growth text-canvas-dark font-black text-xl">
            U
          </div>
          <span>UPORA</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-text-secondary font-medium">
          Create Your Global Account
        </p>
      </div>

      <Card className="border-border-subtle bg-surface shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-text-primary text-center">
            Join the Opportunity Platform
          </CardTitle>
          <CardDescription className="text-xs text-text-secondary text-center">
            Turn practical ability into economic mobility and trusted collaboration.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary">
                I am joining UPORA to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole(GlobalRole.WORKER)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                    role === GlobalRole.WORKER
                      ? "border-brand-growth bg-surface-subtle ring-1 ring-brand-growth text-text-primary"
                      : "border-border-subtle bg-surface-subtle/40 text-text-secondary hover:border-border-subtle"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <UserCheck className="h-4 w-4 text-brand-growth" />
                    {role === GlobalRole.WORKER && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-growth" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-text-primary">Learn & Work</div>
                  <div className="text-[10px] text-text-secondary leading-tight">
                    Prove skills, build passport & earn income
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole(GlobalRole.CLIENT)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                    role === GlobalRole.CLIENT
                      ? "border-brand-focus bg-surface-subtle ring-1 ring-brand-focus text-text-primary"
                      : "border-border-subtle bg-surface-subtle/40 text-text-secondary hover:border-border-subtle"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Briefcase className="h-4 w-4 text-blue-400" />
                    {role === GlobalRole.CLIENT && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-text-primary">Hire Talent</div>
                  <div className="text-[10px] text-text-secondary leading-tight">
                    Post tasks, fund escrow & hire verified talent
                  </div>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              placeholder="e.g. Marvellous Esohwode"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (min 8 chars, 1 uppercase, 1 number)"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                  Country / Region
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-xs text-text-primary focus:border-brand-focus focus:bg-surface focus:outline-none"
                >
                  <option value="NG">Nigeria (NG)</option>
                  <option value="US">United States (US)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="KE">Kenya (KE)</option>
                  <option value="GH">Ghana (GH)</option>
                  <option value="IN">India (IN)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="GLOBAL">Other / Global Remote</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <div className="p-2.5 rounded-lg border border-border-subtle bg-surface-subtle text-[10px] text-text-secondary">
                  Detected Timezone: <span className="text-text-primary font-mono">{Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}</span>
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-3" isLoading={isLoading}>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pt-2 border-t border-border-subtle/40 flex justify-center text-xs text-text-secondary">
          <span>Already have an account? </span>
          <Link href="/login" className="ml-1 text-brand-growth font-medium hover:underline">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
