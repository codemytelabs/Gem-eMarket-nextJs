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
    <div className="absolute bottom-full right-0 mb-3 w-80 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
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

      <div className="max-h-96 overflow-y-auto">
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
