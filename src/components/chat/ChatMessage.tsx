"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

/**
 * Basic inline markdown: **bold**, *italic*, `code`
 */
function renderMarkdown(text: string): string {
  return (
    text
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic: *text* (but not inside bold)
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
      // Inline code: `text`
      .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
      // Line breaks
      .replace(/\n/g, "<br />")
  );
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
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
}
