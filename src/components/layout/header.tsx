"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUpora } from "@/lib/store/useUporaStore";
import { useAuth } from "@/lib/auth/context";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Award,
  Search,
  LogOut,
  LogIn,
  UserCheck,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { profile, financials } = useUpora();
  const { user, logout, isLoading } = useAuth();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Compass },
    { href: "/discover", label: "Navigator", icon: Search },
    { href: "/learn", label: "Learn & Practice", icon: BookOpen },
    { href: "/work", label: "Workplace", icon: Briefcase },
    { href: "/opportunities", label: "Opportunities", icon: ShieldCheck },
    { href: "/passport", label: "Skill Passport", icon: Award },
    { href: "/finance", label: "Finances", icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-growth text-canvas-dark font-black text-xl tracking-wider shadow-sm group-hover:bg-brand-growth-hover transition-colors">
              U
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-text-primary">
                  UPORA
                </span>
                <span className="hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide bg-surface-subtle text-text-secondary border border-border-subtle">
                  GLOBAL
                </span>
              </div>
              <p className="hidden md:block text-[10px] font-medium tracking-widest text-text-secondary uppercase">
                Learn · Work · Earn · Grow
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-surface-subtle text-brand-growth font-semibold"
                      : "text-text-secondary hover:bg-surface-subtle/60 hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Telemetry & Auth Section */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Earnings / Balance Badge */}
          <Link
            href="/finance"
            className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-subtle px-3 py-1.5 text-xs transition-colors hover:border-brand-growth/50"
          >
            <span className="text-text-secondary hidden sm:inline">Balance:</span>
            <span className="font-mono font-semibold text-brand-growth">
              {formatCurrency(financials.availableBalanceUSD)}
            </span>
          </Link>

          {/* Authentication State */}
          {user ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="/passport"
                className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-subtle focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full border border-border-subtle bg-brand-growth/15 text-brand-growth overflow-hidden flex items-center justify-center font-bold text-xs">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-semibold text-text-primary truncate max-w-[120px]">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-text-secondary flex items-center gap-1">
                    <span className="capitalize">{user.role.toLowerCase()}</span>
                    <span>·</span>
                    <span className="text-brand-growth">Verified</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => logout()}
                className="rounded-lg p-2 text-text-secondary hover:bg-surface-subtle hover:text-rose-400 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : !isLoading ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs">
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary" className="text-xs">
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
