import { requireRole } from "@/lib/auth";
import { Role, SUPER_ADMIN_EMAIL } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { formatDate } from "@/lib/utils";
import { UserRoleModal } from "@/components/dashboard/UserRoleModal";

export default async function DashboardUsersPage() {
  await requireRole([Role.SUPER_ADMIN]);
  await connectToDatabase();

  const users = await User.find().sort({ createdAt: -1 }).lean();

  const formattedUsers = users.map((u: any) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role as Role,
    status: u.status,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Staff & User Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Super Admin controls. Manage roles, promote editors to administrators, or revoke studio access.
        </p>
      </div>

      <div className="bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Role Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {formattedUsers.map((u) => {
                const isSuperAdminEmail =
                  u.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

                return (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-4 px-4 font-serif font-bold text-slate-900 dark:text-white text-sm">
                      {u.name}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {u.email}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isSuperAdminEmail
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-black"
                            : u.role === Role.ADMIN
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                            : u.role === Role.EDITOR
                            ? "bg-purple-500/15 text-purple-700 dark:text-purple-400"
                            : "bg-slate-500/15 text-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === "active"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        ● {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <UserRoleModal user={u} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
