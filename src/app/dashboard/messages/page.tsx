import { requireRole } from "@/lib/auth";
import { Role } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { formatDate } from "@/lib/utils";
import { MessageCardClient } from "@/components/dashboard/MessageCardClient";

export default async function DashboardMessagesPage() {
  await requireRole([Role.SUPER_ADMIN, Role.ADMIN]);
  await connectToDatabase();

  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();

  const formattedMessages = messages.map((m: any) => ({
    _id: m._id.toString(),
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    read: m.read,
    createdAt: m.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Contact & Pitch Inbox
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Messages and story pitches submitted via the public contact form.
        </p>
      </div>

      <div className="space-y-4">
        {formattedMessages.map((msg) => (
          <MessageCardClient key={msg._id} message={msg} />
        ))}

        {formattedMessages.length === 0 && (
          <div className="bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center text-slate-500">
            Inbox is empty. No contact messages received yet.
          </div>
        )}
      </div>
    </div>
  );
}
