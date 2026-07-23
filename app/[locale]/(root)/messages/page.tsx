import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex h-full items-center justify-center text-center px-6">
      <div>
        <MessageCircle className="h-10 w-10 text-light-text mx-auto mb-3" />
        <p className="text-sm text-light-text">
          Select a conversation to view your messages
        </p>
      </div>
    </div>
  );
}
