"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { CheckCheck } from "lucide-react";
import { useMessagingStore } from "@/store/messagingStore";
import { formatDistanceToNow } from "@/lib/utils/date";
import { getNotificationIcon } from "@/lib/messaging/notification-ui";

export default function NotificationsDropdown() {
  const { data: session } = useSession();
  const notifications = useMessagingStore((s) => s.notifications);
  const closeNotificationsPanel = useMessagingStore(
    (s) => s.closeNotificationsPanel,
  );
  const markNotificationRead = useMessagingStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useMessagingStore(
    (s) => s.markAllNotificationsRead,
  );

  if (!session?.user) return null;

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden z-50">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-text">Notifications</span>
        {hasUnread && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-light-text">
            No notifications yet
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <li key={notification.id}>
                  <Link
                    href={notification.link}
                    onClick={() => {
                      if (!notification.read)
                        markNotificationRead(notification.id);
                      closeNotificationsPanel();
                    }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-background transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`truncate text-sm ${!notification.read ? "font-semibold text-text" : "font-medium text-text"}`}
                        >
                          {notification.title}
                        </p>
                        {notification.count > 1 && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            {notification.count}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-light-text">
                        {notification.body}
                      </p>
                      <p className="mt-0.5 text-[11px] text-light-text">
                        {formatDistanceToNow(new Date(notification.createdAt))}{" "}
                        ago
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-premium" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
