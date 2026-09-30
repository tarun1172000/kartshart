"use client";

import Link from "next/link";
import { PlusCircle, Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useState } from "react";
import { Role } from "@/lib/constants";
import { logoutAction } from "@/actions/auth";

interface DashboardHeaderProps {
  title?: string;
  userRole?: Role;
  userEmail?: string;
}

export function DashboardHeader({
  title = "Editorial Dashboard",
  userRole,
  userEmail,
}: DashboardHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0c0e14]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle Dashboard Menu"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <h1 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Create Post</span>
        </Link>

        <ThemeToggle />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex" onClick={() => setMobileNavOpen(false)}>
          <div className="w-72 bg-white dark:bg-[#0c0e14] h-full p-6 flex flex-col justify-between shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                  Kartshart Studio
                </span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Overview
                </Link>
                <Link
                  href="/dashboard/posts"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Articles & Posts
                </Link>
                <Link
                  href="/dashboard/posts/new"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Write New Post
                </Link>
                <Link
                  href="/dashboard/categories"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Categories
                </Link>
                <Link
                  href="/dashboard/tags"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Tags
                </Link>
                <Link
                  href="/dashboard/media"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Media URL Helper
                </Link>
                <Link
                  href="/dashboard/messages"
                  onClick={() => setMobileNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Inbox Messages
                </Link>
                {userRole === Role.SUPER_ADMIN && (
                  <>
                    <Link
                      href="/dashboard/access-requests"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 rounded-lg text-amber-600 dark:text-amber-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Access Requests
                    </Link>
                    <Link
                      href="/dashboard/users"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Staff & Users
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMobileNavOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Site Settings
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <button
              onClick={async () => {
                await logoutAction();
                window.location.href = "/login";
              }}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
