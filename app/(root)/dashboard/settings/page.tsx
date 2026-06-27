import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsForm from "./_components/SettingsForm";
import { getSellerPlanName } from "@/lib/getSellerPlanName";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const planName = await getSellerPlanName(session.user.id);

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
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      <SettingsForm user={user!} planName={planName} />
    </div>
  );
}
