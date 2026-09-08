"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Award,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/learn", label: "Learn", icon: BookOpen },
    { href: "/work", label: "Work", icon: Briefcase },
    { href: "/opportunities", label: "Opps", icon: ShieldCheck },
    { href: "/passport", label: "Passport", icon: Award },
    { href: "/finance", label: "Finance", icon: TrendingUp },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-surface/95 px-2 backdrop-blur-md lg:hidden"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors focus:outline-none ${
              isActive
                ? "text-brand-growth font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
