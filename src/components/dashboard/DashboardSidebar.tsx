"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  PlusCircle,
  FolderTree,
  Tag,
  Image as ImageIcon,
  UserCheck,
  Users,
  Settings,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Role } from "@/lib/constants";
import { logoutAction } from "@/actions/auth";

interface DashboardSidebarProps {
  userRole: Role;
  userEmail: string;
  userName: string;
  pendingRequestsCount?: number;
  unreadMessagesCount?: number;
}

export function DashboardSidebar({
  userRole,
  userEmail,
  userName,
  pendingRequestsCount = 0,
  unreadMessagesCount = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = userRole === Role.SUPER_ADMIN;
  const isAdminOrSuper = isSuperAdmin || userRole === Role.ADMIN;

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
    },
    {
      label: "Articles & Posts",
      href: "/dashboard/posts",
      icon: FileText,
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
    },
    {
      label: "Write New Post",
      href: "/dashboard/posts/new",
      icon: PlusCircle,
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
    },
    {
      label: "Categories",
      href: "/dashboard/categories",
      icon: FolderTree,
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
    },
    {
      label: "Tags",
      href: "/dashboard/tags",
      icon: Tag,
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
    },
    {
      label: "Media URL Helper",
      href: "/dashboard/media",
      icon: ImageIcon,
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
    },
    {
      label: "Inbox Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
    },
    {
      label: "Access Requests",
      href: "/dashboard/access-requests",
      icon: UserCheck,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: "bg-amber-500 text-slate-950 font-bold",
      roles: [Role.SUPER_ADMIN],
    },
    {
      label: "Staff & Users",
      href: "/dashboard/users",
      icon: Users,
      roles: [Role.SUPER_ADMIN],
    },
    {
      label: "Site Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: [Role.SUPER_ADMIN],
    },
  ];

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e14] flex flex-col justify-between h-screen sticky top-0">
      {/* Top Brand */}
      <div>
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-amber-500 flex items-center justify-center text-white dark:text-slate-950 font-serif font-black text-lg">
              K
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-slate-900 dark:text-white leading-none">
                Kartshart
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 mt-0.5">
                Studio
              </span>
            </div>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
            title="View Live Website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation links */}
        <div className="p-4 space-y-1">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      item.badgeColor || "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User info & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
              {userName || "Staff"}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                isSuperAdmin
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  : "bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30"
              }`}
            >
              {userRole}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {userEmail}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
