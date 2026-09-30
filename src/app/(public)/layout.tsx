import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole={user?.role} userName={user?.name} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
