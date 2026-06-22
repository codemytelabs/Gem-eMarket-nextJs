import { signInWithCustomToken } from "firebase/auth";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseAuth, firestoreClient } from "@/lib/firebase-client";
import type {
  Conversation,
  Message,
  NotificationDoc,
} from "@/lib/messaging/types";

let signInPromise: Promise<void> | null = null;

// Signs the browser into Firebase Auth using a custom token minted from the
// NextAuth session, so request.auth.uid in Firestore rules matches our
// Postgres User.id. Safe to call repeatedly — only signs in once per session.
export function ensureFirebaseAuth(): Promise<void> {
  if (firebaseAuth.currentUser) return Promise.resolve();
  if (signInPromise) return signInPromise;

  const promise = fetch("/api/firebase/custom-token")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to mint Firebase custom token");
      return res.json();
    })
    .then(({ token }: { token: string }) =>
      signInWithCustomToken(firebaseAuth, token),
    )
    .then(() => undefined)
    .catch((err) => {
      signInPromise = null;
      throw err;
    });

  signInPromise = promise;
  return promise;
}

function toMillis(value: Timestamp | undefined | null): number {
  return value ? value.toMillis() : 0;
}

function toConversation(
  id: string,
  data: Record<string, unknown>,
): Conversation {
  return {
    id,
    participants: data.participants as [string, string],
    buyerId: data.buyerId as string,
    buyerName: data.buyerName as string,
    sellerId: data.sellerId as string,
    sellerName: data.sellerName as string,
    lastMessage: (data.lastMessage as string) ?? "",
    lastMessageAt: toMillis(data.lastMessageAt as Timestamp | undefined),
    lastSenderId: (data.lastSenderId as string) ?? "",
    unread: (data.unread as Record<string, number>) ?? {},
    createdAt: toMillis(data.createdAt as Timestamp | undefined),
  };
}

// Deliberately no orderBy here — combining it with array-contains would
// require a composite index to be created in the Firebase console before
// this query works at all (it silently never fires until that's done).
// Sorting client-side avoids that setup step entirely for a per-user list
// this small.
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void,
): Unsubscribe {
  const q = query(
    collection(firestoreClient, "conversations"),
    where("participants", "array-contains", userId),
  );

  return onSnapshot(
    q,
    (snap) => {
      const conversations = snap.docs
        .map((d) => toConversation(d.id, d.data()))
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      callback(conversations);
    },
    (err) => console.error("[messaging] subscribeToConversations failed:", err),
  );
}

// Single-conversation listener so a chat thread can show its header (which
// listing, which counterpart) without depending on the bulk conversations
// list having loaded that specific document yet.
export function subscribeToConversation(
  conversationId: string,
  callback: (conversation: Conversation | null) => void,
): Unsubscribe {
  return onSnapshot(
    doc(firestoreClient, "conversations", conversationId),
    (snap) =>
      callback(snap.exists() ? toConversation(snap.id, snap.data()) : null),
    (err) => console.error("[messaging] subscribeToConversation failed:", err),
  );
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void,
): Unsubscribe {
  const q = query(
    collection(firestoreClient, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: toMillis(data.createdAt),
            replyTo: data.replyTo ?? null,
            listingContext: data.listingContext ?? null,
          } satisfies Message;
        }),
      );
    },
    (err) => console.error("[messaging] subscribeToMessages failed:", err),
  );
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(firestoreClient, "notifications", userId, "items"),
    orderBy("createdAt", "desc"),
    limit(30),
  );

  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: data.type,
            title: data.title,
            body: data.body,
            link: data.link,
            read: data.read ?? false,
            count: data.count ?? 1,
            conversationId: data.conversationId ?? undefined,
            createdAt: toMillis(data.createdAt),
          } satisfies NotificationDoc;
        }),
      );
    },
    (err) => console.error("[messaging] subscribeToNotifications failed:", err),
  );
}
