"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
  title: string;
  url: string;
  variant?: "icon" | "full" | "whatsapp" | "copy";
  className?: string;
}

export function ShareButton({ title, url, variant = "full", className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith("http") ? url : `https://advantagenys.com${url}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = fullUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fullUrl]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or share failed — fall back to copy
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  }, [title, fullUrl, copyToClipboard]);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${title}\n${fullUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [title, fullUrl]);

  if (variant === "whatsapp") {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleWhatsApp}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-[var(--radius)] bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors duration-[var(--transition)] cursor-pointer ${className}`}
        aria-label="Share via WhatsApp"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </motion.button>
    );
  }

  if (variant === "copy") {
    return (
      <div className="relative inline-flex">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={copyToClipboard}
          className={`inline-flex items-center justify-center p-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--blue-accent)] hover:bg-[var(--blue-pale)] transition-colors duration-[var(--transition)] cursor-pointer ${className}`}
          aria-label="Copy link"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.svg
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--green)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium text-[var(--green)] whitespace-nowrap"
            >
              Copied!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className={`inline-flex items-center justify-center p-2.5 rounded-[var(--radius)] bg-[var(--blue-accent)] text-white hover:opacity-90 transition-all duration-[var(--transition)] cursor-pointer ${className}`}
        aria-label={`Share ${title}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </motion.button>
    );
  }

  // variant === "full"
  return (
    <div className="relative inline-flex">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-[var(--radius)] bg-[var(--blue-accent)] text-white hover:opacity-90 transition-all duration-[var(--transition)] cursor-pointer ${className}`}
        aria-label={`Share ${title}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {copied ? "Link Copied!" : "Share"}
      </motion.button>
    </div>
  );
}
