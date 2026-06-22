import { create } from "zustand";
import {
  ensureFirebaseAuth,
  subscribeToConversations,
  subscribeToNotifications,
} from "@/lib/messaging/client";
import type {
  Conversation,
  MessageListingContext,
  MessageReplyTo,
  NotificationDoc,
} from "@/lib/messaging/types";

interface MessagingState {
  userId: string | null;
  conversations: Conversation[];
  notifications: NotificationDoc[];
  toasts: NotificationDoc[];
  isMessagesPopoverOpen: boolean;
  isNotificationsPanelOpen: boolean;
  unsubscribeConversations: (() => void) | null;
  unsubscribeNotifications: (() => void) | null;
  hasLoadedNotificationsOnce: boolean;

  initMessaging: (userId: string) => void;
  reset: () => void;
  toggleMessagesPopover: () => void;
  closeMessagesPopover: () => void;
  toggleNotificationsPanel: () => void;
  closeNotificationsPanel: () => void;
  dismissToast: (id: string) => void;
  pushLocalToast: (toast: {
    title: string;
    body: string;
    link: string;
    count?: number;
  }) => void;
  sendMessage: (
    conversationId: string,
    text: string,
    replyTo?: MessageReplyTo,
    listingContext?: MessageListingContext,
  ) => Promise<void>;
  markConversationRead: (conversationId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  unreadMessagesTotal: () => number;
  unreadNotificationsTotal: () => number;
}

export const useMessagingStore = create<MessagingState>()((set, get) => ({
  userId: null,
  conversations: [],
  notifications: [],
  toasts: [],
  isMessagesPopoverOpen: false,
  isNotificationsPanelOpen: false,
  unsubscribeConversations: null,
  unsubscribeNotifications: null,
  hasLoadedNotificationsOnce: false,

  initMessaging: (userId) => {
    if (get().userId === userId) return; // already initialized for this user
    get().unsubscribeConversations?.();
    get().unsubscribeNotifications?.();

    set({
      userId,
      conversations: [],
      notifications: [],
      toasts: [],
      hasLoadedNotificationsOnce: false,
    });

    ensureFirebaseAuth()
      .then(() => {
        if (get().userId !== userId) return; // logged out/changed before sign-in resolved

        const unsubConversations = subscribeToConversations(
          userId,
          (conversations) => {
            set({ conversations });
          },
        );

        const unsubNotifications = subscribeToNotifications(
          userId,
          (notifications) => {
            const { hasLoadedNotificationsOnce, notifications: previous } =
              get();
            if (hasLoadedNotificationsOnce) {
              const previousById = new Map(previous.map((n) => [n.id, n]));
              // Toast-worthy = genuinely new, or an existing unread notification
              // whose count just went up (e.g. a 2nd/3rd message arrived in the
              // same still-unread conversation) — not every Firestore update.
              const toastWorthy = notifications.filter((n) => {
                if (n.read) return false;
                const prev = previousById.get(n.id);
                return !prev || prev.count < n.count;
              });
              if (toastWorthy.length > 0) {
                set((state) => {
                  const refreshedIds = new Set(toastWorthy.map((n) => n.id));
                  return {
                    toasts: [
                      ...state.toasts.filter((t) => !refreshedIds.has(t.id)),
                      ...toastWorthy,
                    ],
                  };
                });
              }
            }
            set({ notifications, hasLoadedNotificationsOnce: true });
          },
        );

        set({
          unsubscribeConversations: unsubConversations,
          unsubscribeNotifications: unsubNotifications,
        });
      })
      .catch(() => {
        // Firestore custom-token sign-in failed — badges/popovers stay empty.
      });
  },

  reset: () => {
    get().unsubscribeConversations?.();
    get().unsubscribeNotifications?.();
    set({
      userId: null,
      conversations: [],
      notifications: [],
      toasts: [],
      unsubscribeConversations: null,
      unsubscribeNotifications: null,
      hasLoadedNotificationsOnce: false,
    });
  },

  toggleMessagesPopover: () =>
    set((state) => ({
      isMessagesPopoverOpen: !state.isMessagesPopoverOpen,
      isNotificationsPanelOpen: false,
    })),
  closeMessagesPopover: () => set({ isMessagesPopoverOpen: false }),

  toggleNotificationsPanel: () =>
    set((state) => ({
      isNotificationsPanelOpen: !state.isNotificationsPanelOpen,
      isMessagesPopoverOpen: false,
    })),
  closeNotificationsPanel: () => set({ isNotificationsPanelOpen: false }),

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // For client-only notices that don't come from Firestore (e.g. "new
  // listings since your last visit") — not gated behind login.
  pushLocalToast: ({ title, body, link, count }) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `local-${Date.now()}`,
          type: "new_listings",
          title,
          body,
          link,
          read: false,
          count: count ?? 1,
          createdAt: Date.now(),
        },
      ],
    })),

  sendMessage: async (conversationId, text, replyTo, listingContext) => {
    await fetch(`/api/messages/${conversationId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, replyTo, listingContext }),
    });
  },

  markConversationRead: async (conversationId) => {
    await fetch(`/api/messages/${conversationId}/read`, { method: "POST" });
  },

  markNotificationRead: async (notificationId) => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
  },

  markAllNotificationsRead: async () => {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  },

  unreadMessagesTotal: () => {
    const { conversations, userId } = get();
    if (!userId) return 0;
    return conversations.reduce((sum, c) => sum + (c.unread[userId] ?? 0), 0);
  },

  unreadNotificationsTotal: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
