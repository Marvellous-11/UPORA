"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl tracking-tight text-text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-growth text-canvas-dark font-black text-xl">
            U
          </div>
          <span>UPORA</span>
        </Link>
        <p className="text-xs uppercase tracking-widest text-text-secondary font-medium">
          Global Opportunity Platform
        </p>
      </div>

      <Card className="border-border-subtle bg-surface shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-text-primary text-center">
            Sign In to Your Account
          </CardTitle>
          <CardDescription className="text-xs text-text-secondary text-center">
            Enter your credentials to access your roadmaps, verified skills, and marketplace tasks.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg border border-rose-800/60 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <Input
              label="Work or Personal Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-border-subtle/60 space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary text-center">
              Development Quick-Fill Logins:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[11px] py-1 h-auto"
                onClick={() => handleQuickDemo("worker@upora.org", "Password123!")}
              >
                Worker
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[11px] py-1 h-auto"
                onClick={() => handleQuickDemo("client@upora.org", "Password123!")}
              >
                Client
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[11px] py-1 h-auto"
                onClick={() => handleQuickDemo("admin@upora.org", "AdminPassword123!")}
              >
                Admin
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-border-subtle/40 flex justify-center text-xs text-text-secondary">
          <span>Don&apos;t have an account yet? </span>
          <Link href="/register" className="ml-1 text-brand-growth font-medium hover:underline">
            Create Account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
