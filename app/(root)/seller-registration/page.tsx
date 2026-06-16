import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SellerRegistrationWizard } from "./_components/SellerRegistrationWizard";

export const metadata: Metadata = {
  title: "Become a Seller",
  description:
    "Set up your seller profile and start listing gems and jewellery on the marketplace.",
};

export default async function SellerRegistrationPage() {
  const session = await auth();

  if (!session) redirect("/login?next=/seller-registration");
  if (session.user.role !== "BUYER") redirect("/dashboard");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      country: true,
      locationCity: true,
    },
  });

  return (
    <SellerRegistrationWizard
      name={user?.name ?? session.user.name}
      email={user?.email ?? session.user.email ?? ""}
      phone={user?.phone ?? null}
      savedCountry={user?.country ?? "LK"}
      savedCity={user?.locationCity ?? ""}
    />
  );
}
