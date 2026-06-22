import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase-client";

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const params = new URLSearchParams({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  });

  return navigator.serviceWorker
    .register(`/firebase-messaging-sw.js?${params.toString()}`)
    .catch(() => null);
}

// Requests notification permission (if not already decided), registers the FCM
// service worker, and saves the resulting device token to our backend so it can
// be used for background push when this tab/browser is closed. No-ops quietly
// if the browser doesn't support push, the user denies permission, or
// registration fails for any reason (e.g. an ad-blocker blocking the script) —
// background push is best-effort and in-app messaging works without it.
export async function enablePushNotifications(): Promise<void> {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") return;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    const registration = await registerServiceWorker();
    if (!registration) return;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: registration,
    }).catch(() => null);

    if (!token) return;

    await fetch("/api/fcm/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {});
  } catch {
    // Best-effort — push is additive on top of in-app Firestore listeners.
  }
}

export function getNotificationPermissionState():
  | NotificationPermission
  | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}
