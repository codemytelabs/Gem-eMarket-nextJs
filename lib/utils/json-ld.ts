// JSON.stringify does not escape "</script>", so user-controlled content
// (e.g. a listing description containing "</script><script>...") can break
// out of a JSON-LD <script> tag and execute as HTML/JS. Escape it here.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
}
