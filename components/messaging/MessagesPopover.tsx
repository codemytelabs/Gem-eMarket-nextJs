"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { X, Maximize2 } from "lucide-react";
import { useMessagingStore } from "@/store/messagingStore";
import ConversationList from "@/components/messaging/ConversationList";

export default function MessagesPopover() {
  const { data: session } = useSession();
  const conversations = useMessagingStore((s) => s.conversations);
  const closeMessagesPopover = useMessagingStore((s) => s.closeMessagesPopover);

  if (!session?.user) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[100] rounded-xl border border-border bg-surface shadow-2xl overflow-hidden sm:absolute sm:inset-x-auto sm:bottom-full sm:right-0 sm:mb-3 sm:w-80">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={closeMessagesPopover}
            className="text-light-text hover:text-text"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <Link
            href="/messages"
            onClick={closeMessagesPopover}
            className="text-light-text hover:text-text"
            aria-label="Open in full view"
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
        </div>
        <span className="text-sm font-semibold text-text">Messages</span>
      </div>

      <div className="max-h-[60vh] overflow-y-auto sm:max-h-96">
        <ConversationList
          conversations={conversations.slice(0, 10)}
          currentUserId={session.user.id}
          onSelect={closeMessagesPopover}
          emptyText="No messages yet"
        />
      </div>

      <Link
        href="/messages"
        onClick={closeMessagesPopover}
        className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-background"
      >
        Show more
      </Link>
    </div>
  );
}
