import { auth } from "@/auth";
import { db } from "@/lib/db";
import SettingsForm from "./_components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      locationCity: true,
      shopSlug: true,
      shopBio: true,
      whatsappNumber: true,
      specialties: true,
      shopMetaTitle: true,
      shopMetaDescription: true,
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      <SettingsForm user={user!} planName={session.user.planName} />
    </div>
  );
}
