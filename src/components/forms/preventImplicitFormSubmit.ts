import type { KeyboardEvent } from "react";

const NON_TEXT_SUBMIT_TYPES = new Set(["button", "submit", "reset", "image"]);

export function preventImplicitFormSubmit(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

  const target = event.target as HTMLElement | null;
  if (!target) return;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "textarea" || tagName === "button") return;

  if (target instanceof HTMLInputElement && NON_TEXT_SUBMIT_TYPES.has(target.type)) {
    return;
  }

  event.preventDefault();
}
