"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useMessagingStore } from "@/store/messagingStore";
import ConversationList from "@/components/messaging/ConversationList";

export default function MessagesSidebar() {
  const { data: session } = useSession();
  const conversations = useMessagingStore((s) => s.conversations);
  const params = useParams<{ conversationId?: string }>();

  if (!session?.user) return null;

  return (
    <aside className="w-full max-w-xs shrink-0 border-r border-border overflow-y-auto">
      <div className="border-b border-border px-4 py-4">
        <h1 className="text-lg font-bold text-text">Messages</h1>
      </div>
      <ConversationList
        conversations={conversations}
        currentUserId={session.user.id}
        activeConversationId={params?.conversationId}
        emptyText="No messages yet — enquiries you send or receive will show up here"
      />
    </aside>
  );
}
