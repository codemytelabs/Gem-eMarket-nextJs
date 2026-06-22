import {
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/lib/messaging/types";

export function getNotificationIcon(type: NotificationType): LucideIcon {
  switch (type) {
    case "message":
      return MessageCircle;
    case "enquiry":
      return MessageSquare;
    case "listing_approved":
      return CheckCircle2;
    case "listing_changes_requested":
      return AlertTriangle;
    case "listing_rejected":
      return XCircle;
    case "new_listings":
      return Sparkles;
  }
}
