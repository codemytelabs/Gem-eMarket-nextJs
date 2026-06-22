import ChatThread from "@/components/messaging/ChatThread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <ChatThread conversationId={conversationId} />;
}
