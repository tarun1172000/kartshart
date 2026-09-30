import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Role } from "@/lib/constants";
import connectToDatabase from "@/lib/mongodb";
import { AccessRequest, AccessRequestStatus } from "@/models/AccessRequest";
import { ContactMessage } from "@/models/ContactMessage";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  await connectToDatabase();

  let pendingRequestsCount = 0;
  let unreadMessagesCount = 0;

  if (user.role === Role.SUPER_ADMIN) {
    pendingRequestsCount = await AccessRequest.countDocuments({
      status: AccessRequestStatus.PENDING,
    });
  }

  if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
    unreadMessagesCount = await ContactMessage.countDocuments({ read: false });
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-[#08090d]">
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          userRole={user.role}
          userEmail={user.email}
          userName={user.name}
          pendingRequestsCount={pendingRequestsCount}
          unreadMessagesCount={unreadMessagesCount}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Editorial Studio"
          userRole={user.role}
          userEmail={user.email}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
