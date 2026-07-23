import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MessagesSidebar from "./_components/MessagesSidebar";

export const metadata = { title: "Messages" };

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login?next=/messages");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex h-[calc(100vh-220px)] min-h-[480px] rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <MessagesSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
