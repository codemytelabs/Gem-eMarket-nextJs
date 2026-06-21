import { db } from "@/lib/db";
import { UserList } from "@/components/admin/UserList";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const [users, plans] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { listings: true } },
      },
    }),
    db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    createdAt: u.createdAt.toISOString(),
    listingCount: u._count.listings,
    planId: u.subscription?.plan.id ?? null,
    planName: u.subscription?.plan.displayName ?? null,
    planSlug: u.subscription?.plan.name ?? "free",
  }));

  const planOptions = plans.map((p) => ({
    id: p.id,
    name: p.name,
    displayName: p.displayName,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage registered users and seller plans.
        </p>
      </div>

      <UserList users={serializedUsers} plans={planOptions} />
    </div>
  );
}
