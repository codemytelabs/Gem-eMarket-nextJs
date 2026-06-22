"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/date";
import type { Conversation } from "@/lib/messaging/types";

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId?: string;
  onSelect?: (conversationId: string) => void;
  emptyText?: string;
}

export default function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onSelect,
  emptyText = "No messages yet",
}: Props) {
  if (conversations.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-light-text">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {conversations.map((conversation) => {
        const isBuyer = conversation.buyerId === currentUserId;
        const counterpartName = isBuyer
          ? conversation.sellerName
          : conversation.buyerName;
        const unreadCount = conversation.unread[currentUserId] ?? 0;

        return (
          <li key={conversation.id}>
            <Link
              href={`/messages/${conversation.id}`}
              onClick={() => onSelect?.(conversation.id)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors ${
                activeConversationId === conversation.id ? "bg-background" : ""
              }`}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm ${unreadCount > 0 ? "font-semibold text-text" : "font-medium text-text"}`}
                  >
                    {counterpartName}
                  </span>
                  <span className="shrink-0 text-xs text-light-text">
                    {conversation.lastMessageAt
                      ? `${formatDistanceToNow(new Date(conversation.lastMessageAt))} ago`
                      : ""}
                  </span>
                </div>
                <p
                  className={`truncate text-sm ${unreadCount > 0 ? "font-medium text-text" : "text-light-text"}`}
                >
                  {conversation.lastMessage || "No messages yet"}
                </p>
              </div>

              {unreadCount > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-premium text-xs text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
