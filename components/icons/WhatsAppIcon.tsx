// A generic, line-style chat-bubble + handset glyph used to indicate a
// WhatsApp contact option — deliberately not a reproduction of Meta's
// official WhatsApp logo (color, shape, proportions), to stay clear of
// their brand-asset usage rules while still being recognizable.
export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 21l1.65-4.95A8.5 8.5 0 1 1 8.5 19.5L3 21z" />
      <path d="M8.5 11c0 2.5 2 4.5 4.5 4.5.4 0 .8-.3.8-.7v-.8c0-.3-.2-.6-.5-.7l-1.2-.4c-.3-.1-.6 0-.8.2l-.3.4c-1-.6-1.8-1.4-2.4-2.4l.4-.3c.2-.2.3-.5.2-.8l-.4-1.2c-.1-.3-.4-.5-.7-.5h-.8c-.4 0-.7.4-.7.8 0 .3 0 .6.1.9z" />
    </svg>
  );
}
