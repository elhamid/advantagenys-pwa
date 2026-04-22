"use client";

import DOMPurify from "isomorphic-dompurify";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

/**
 * Basic inline markdown: **bold**, *italic*, `code`, lists
 */
function renderMarkdown(text: string): string {
  return (
    text
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic: *text* (but not inside bold)
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
      // Inline code: `text`
      .replace(
        /`(.+?)`/g,
        '<code class="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>'
      )
      // Line breaks
      .replace(/\n/g, "<br />")
  );
}

/**
 * DOMPurify hook: every anchor that survives the allowlist is forced to open
 * in a new tab with safe rel attributes.
 */
DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer nofollow");
  }
});

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "a",
];
const ALLOWED_ATTR = ["href", "target", "rel", "class"];

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  if (!content) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "bg-[var(--blue-accent)] text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]"
            : "bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]"
        }
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <p
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sanitize(renderMarkdown(content)),
            }}
          />
        )}
      </div>
    </div>
  );
}
