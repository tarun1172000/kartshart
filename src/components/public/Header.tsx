"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, Compass, Info, Mail, LayoutDashboard, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  userRole?: string | null;
  userName?: string | null;
}

export function Header({ userRole }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = Boolean(userRole);

  const navLinks = [
    { href: "/blog", label: "Articles", icon: BookOpen },
    { href: "/category/technology", label: "Tech", icon: Compass },
    { href: "/category/india", label: "India", icon: Compass },
    { href: "/category/business", label: "Business", icon: Compass },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090a0f]/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-amber-500 flex items-center justify-center text-white dark:text-slate-950 font-serif font-black text-lg shadow-sm transition-transform group-hover:scale-105">
                K
              </div>
              <span className="font-serif text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Kartshart<span className="text-amber-500">.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200 dark:border-slate-800">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-all shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-500" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 top-16 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 z-40 md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Icon className="w-4 h-4 text-amber-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-base font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <LogIn className="w-4 h-4 text-amber-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/request-access"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                >
                  Request Access
                </Link>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </header>
  );
}
