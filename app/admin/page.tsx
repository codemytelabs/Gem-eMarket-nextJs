import Link from "next/link";
import { Users, Gem, Clock, ShoppingBag, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const [
    totalUsers,
    activeListings,
    pendingApproval,
    soldListings,
    recentPending,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.listing.count({ where: { status: "PENDING_REVIEW" } }),
    db.listing.count({ where: { status: "SOLD" } }),
    db.listing.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { seller: { select: { name: true } } },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/users",
    },
    {
      label: "Active Listings",
      value: activeListings,
      icon: Gem,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/admin/listings?status=ACTIVE",
    },
    {
      label: "Pending Approval",
      value: pendingApproval,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/listings",
    },
    {
      label: "Sales",
      value: soldListings,
      icon: ShoppingBag,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/admin/listings?status=SOLD",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of users, listings, and approvals.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div
              className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Needs your review</h2>
            <Link
              href="/admin/listings"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentPending.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nothing pending review right now.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentPending.map((listing) => (
                <li
                  key={listing.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {listing.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {listing.seller.name} ·{" "}
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    Pending
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent signups</h2>
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400">No users yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
