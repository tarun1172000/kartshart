"use client";

import { useState, useTransition } from "react";
import { Shield, UserX } from "lucide-react";
import { Role, SUPER_ADMIN_EMAIL } from "@/lib/constants";
import { updateUserRoleAction, revokeUserAccessAction } from "@/actions/access";

interface UserRoleModalProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: Role;
    status: string;
  };
}

export function UserRoleModal({ user }: UserRoleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);

  const isSuperAdminEmail =
    user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updateUserRoleAction(user._id, selectedRole);
      if (res.success) {
        setIsOpen(false);
      } else {
        alert(res.error);
      }
    });
  };

  const handleRevoke = () => {
    if (!confirm(`Are you sure you want to revoke dashboard access for ${user.email}?`)) {
      return;
    }
    startTransition(async () => {
      const res = await revokeUserAccessAction(user._id);
      if (res.success) {
        setIsOpen(false);
      } else {
        alert(res.error);
      }
    });
  };

  if (isSuperAdminEmail) {
    return (
      <span className="text-xs text-slate-400 font-medium italic">
        Super Admin (Protected)
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
      >
        Manage Role
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#10121a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Manage User: {user.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                User Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white"
              >
                <option value={Role.ADMIN}>ADMIN (Full content control)</option>
                <option value={Role.EDITOR}>
                  EDITOR (Draft authoring & editing)
                </option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={handleRevoke}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 transition-colors"
              >
                <UserX className="w-4 h-4" />
                <span>Revoke All Access</span>
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleUpdate}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? "Updating..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
