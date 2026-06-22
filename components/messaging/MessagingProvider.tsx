"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, X } from "lucide-react";
import { useMessagingStore } from "@/store/messagingStore";
import {
  enablePushNotifications,
  getNotificationPermissionState,
} from "@/lib/messaging/push";
import { categoryLabel } from "@/lib/utils/category-label";
import NotificationToast from "@/components/messaging/NotificationToast";

const DISMISS_KEY = "push-prompt-dismissed";
const LAST_SEEN_LISTINGS_KEY = "listings-last-seen";

export default function MessagingProvider() {
  const { data: session } = useSession();
  const initMessaging = useMessagingStore((s) => s.initMessaging);
  const reset = useMessagingStore((s) => s.reset);
  const pushLocalToast = useMessagingStore((s) => s.pushLocalToast);
  const [showPushBanner, setShowPushBanner] = useState(false);

  useEffect(() => {
    if (session?.user) {
      initMessaging(session.user.id);
      const permission = getNotificationPermissionState();
      if (permission === "default" && !localStorage.getItem(DISMISS_KEY)) {
        setShowPushBanner(true);
      }
    } else {
      reset();
      setShowPushBanner(false);
    }
  }, [session?.user, initMessaging, reset]);

  // "What's new since you were last here" — works for any visitor, not just
  // logged-in users, so it's independent of the session effect above.
  useEffect(() => {
    const lastSeen = localStorage.getItem(LAST_SEEN_LISTINGS_KEY);
    const now = new Date().toISOString();

    if (!lastSeen) {
      localStorage.setItem(LAST_SEEN_LISTINGS_KEY, now);
      return;
    }

    fetch(`/api/listings/new-since?since=${encodeURIComponent(lastSeen)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: { categories: { category: string; count: number }[] } | null,
        ) => {
          if (!data) return;
          const total = data.categories.reduce((sum, c) => sum + c.count, 0);
          if (total === 0) return;

          const breakdown = data.categories
            .map((c) => `${c.count} ${categoryLabel(c.category)}`)
            .join(", ");
          pushLocalToast({
            title: "New listings since your last visit",
            body: breakdown,
            link: "/",
            count: total,
          });
        },
      )
      .catch(() => {})
      .finally(() => localStorage.setItem(LAST_SEEN_LISTINGS_KEY, now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session?.user) return <NotificationToast />;

  return (
    <>
      <NotificationToast />
      {showPushBanner && (
        <div className="fixed bottom-6 left-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-2xl">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text">
              Enable notifications
            </p>
            <p className="mt-0.5 text-xs text-light-text">
              Get alerted instantly when buyers or sellers message you.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={async () => {
                  setShowPushBanner(false);
                  await enablePushNotifications();
                }}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
              >
                Enable
              </button>
              <button
                onClick={() => {
                  localStorage.setItem(DISMISS_KEY, "1");
                  setShowPushBanner(false);
                }}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-light-text hover:bg-background"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.setItem(DISMISS_KEY, "1");
              setShowPushBanner(false);
            }}
            className="text-light-text hover:text-text"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
