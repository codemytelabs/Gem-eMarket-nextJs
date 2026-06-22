// A conversation is per (buyer, seller) pair, not per listing — it's an
// ongoing thread with one person that can span multiple listings over time.
// Which listings were discussed is derived from messages' `listingContext`,
// not stored on the conversation itself.
export interface Conversation {
  id: string;
  participants: [string, string];
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  lastMessageAt: number; // epoch ms
  lastSenderId: string;
  unread: Record<string, number>;
  createdAt: number;
}

export interface MessageReplyTo {
  messageId: string;
  senderId: string;
  text: string;
}

// Attached when a message introduces a particular listing into the thread —
// rendered inline the same way a reply-to quote is, so "this message is about
// this ad" reads visually the same as "this message replies to that message".
export interface MessageListingContext {
  id: string;
  title: string;
  slug: string;
  image: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number; // epoch ms
  replyTo: MessageReplyTo | null;
  listingContext: MessageListingContext | null;
}

export type NotificationType =
  | "message"
  | "enquiry"
  | "listing_approved"
  | "listing_changes_requested"
  | "listing_rejected"
  | "new_listings";

export interface NotificationDoc {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: number; // epoch ms
  count: number; // how many events this notification represents (grouped messages)
  conversationId?: string; // present for type "message" — used to find & merge into one notification
}
