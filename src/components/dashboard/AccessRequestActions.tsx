"use client";

import { useState, useTransition } from "react";
import { Check, X, Shield, AlertCircle } from "lucide-react";
import { Role } from "@/lib/constants";
import {
  approveAccessRequestAction,
  rejectAccessRequestAction,
} from "@/actions/access";

interface AccessRequestActionsProps {
  requestId: string;
  requesterName: string;
  requesterEmail: string;
}

export function AccessRequestActions({
  requestId,
  requesterName,
  requesterEmail,
}: AccessRequestActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role.ADMIN | Role.EDITOR>(
    Role.EDITOR
  );
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveAccessRequestAction(requestId, selectedRole);
      if (result.success) {
        setMessage("Approved successfully!");
        setShowApproveModal(false);
      } else {
        alert(result.error);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectAccessRequestAction(requestId, rejectReason);
      if (result.success) {
        setMessage("Rejected");
        setShowRejectModal(false);
      } else {
        alert(result.error);
      }
    });
  };

  if (message) {
    return <span className="text-xs font-semibold text-slate-500">{message}</span>;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowApproveModal(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Approve</span>
        </button>

        <button
          onClick={() => setShowRejectModal(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#10121a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Approve Access for {requesterName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {requesterEmail} will receive an approval email and will be able to log in via OTP.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Assign Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as Role.ADMIN | Role.EDITOR)
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white"
              >
                <option value={Role.EDITOR}>
                  EDITOR (Can create & edit drafts, submit for review)
                </option>
                <option value={Role.ADMIN}>
                  ADMIN (Can publish, edit all posts & categories)
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleApprove}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
              >
                {isPending ? "Approving..." : "Confirm & Send Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#10121a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Reject Access Request
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Requester {requesterName} ({requesterEmail}) will be marked as rejected.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Reason / Note (Optional)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Optional reason sent in notification email..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleReject}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
              >
                {isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
