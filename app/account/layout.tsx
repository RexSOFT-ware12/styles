"use client";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Download, KeyRound, PersonStanding, Scissors, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/account", label: "Overview", icon: User, exact: true },
  { href: "/account/purchases", label: "Purchases", icon: Download, exact: false },
  { href: "/account/garment-tool", label: "Garment Tool", icon: Scissors, exact: false },
  { href: "/account/pose-tool", label: "Pose Tool", icon: PersonStanding, exact: false },
  { href: "/account/api", label: "API Access", icon: KeyRound, exact: false },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Individual account pages already render their own "please sign in"
  // prompt when there's no user — this nav just stays out of the way
  // until there's actually an account to navigate.
  const showNav = !loading && user;

  return (
    <div>
      {showNav && (
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1 overflow-x-auto" aria-label="Account navigation">
              {TABS.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
