"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { markContactMessageReadAction } from "@/actions/contact";

interface MessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export function MessageCardClient({ message }: { message: MessageItem }) {
  const [isRead, setIsRead] = useState(message.read);
  const [isPending, startTransition] = useTransition();

  const toggleRead = () => {
    startTransition(async () => {
      const newStatus = !isRead;
      setIsRead(newStatus);
      await markContactMessageReadAction(message._id, newStatus);
    });
  };

  return (
    <div
      className={`p-6 rounded-3xl border transition-all ${
        isRead
          ? "bg-white dark:bg-[#10121a] border-slate-200 dark:border-slate-800/80"
          : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 shadow-xs"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isRead
                ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                : "bg-amber-500 text-slate-950"
            }`}
          >
            {isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
              {message.name} &lt;{message.email}&gt;
            </h4>
            <span className="text-[11px] text-slate-400">
              {formatDate(message.createdAt)}
            </span>
          </div>
        </div>

        <button
          onClick={toggleRead}
          disabled={isPending}
          className="self-start sm:self-auto px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          {isRead ? "Mark as Unread" : "Mark as Read"}
        </button>
      </div>

      <div className="pt-4 space-y-2">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Subject: {message.subject}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {message.message}
        </p>
      </div>
    </div>
  );
}
