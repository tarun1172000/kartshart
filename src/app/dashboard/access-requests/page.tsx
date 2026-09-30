import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { AccessRequest, AccessRequestStatus } from "@/models/AccessRequest";
import { formatDate } from "@/lib/utils";
import { AccessRequestActions } from "@/components/dashboard/AccessRequestActions";

export default async function AccessRequestsPage() {
  await requireRole([Role.SUPER_ADMIN]);
  await connectToDatabase();

  const requests = await AccessRequest.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Contributor Access Requests
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Super Admin review queue. Approve applicants as ADMIN or EDITOR, or reject applications.
        </p>
      </div>

      <div className="bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Reason / Pitch</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {requests.map((req: any) => (
                <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="py-4 px-4 font-serif font-bold text-slate-900 dark:text-white text-sm">
                    {req.name}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {req.email}
                  </td>
                  <td className="py-4 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300" title={req.reason}>
                    "{req.reason}"
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === AccessRequestStatus.PENDING
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                          : req.status === AccessRequestStatus.APPROVED
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {req.status === AccessRequestStatus.PENDING ? (
                      <AccessRequestActions
                        requestId={req._id.toString()}
                        requesterName={req.name}
                        requesterEmail={req.email}
                      />
                    ) : (
                      <span className="text-slate-400 italic">
                        {req.status === AccessRequestStatus.APPROVED ? "Approved" : "Rejected"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              No access requests in queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
