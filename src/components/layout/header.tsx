"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUpora } from "@/lib/store/useUporaStore";
import { formatCurrency } from "@/lib/utils";
import {
  Compass,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Award,
  Search,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { profile, financials } = useUpora();

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

        {/* User Telemetry & Wallet Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
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

          {/* Reputation Badge */}
          <Link
            href="/passport"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1.5 text-xs"
            title="Verified Reputation Score based on project assessments and on-time client deliveries"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-mono font-medium text-text-primary">
              {profile.reputationScore.toFixed(1)}%
            </span>
          </Link>

          {/* User Profile Avatar Link */}
          <Link
            href="/passport"
            className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-brand-focus"
          >
            <div className="h-8 w-8 rounded-full border border-border-subtle bg-surface-subtle overflow-hidden flex items-center justify-center font-bold text-xs text-text-primary">
              ME
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-text-primary">{profile.fullName}</div>
              <div className="text-[10px] text-text-secondary">Talent · Verified</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
