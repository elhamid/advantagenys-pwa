"use client";

import { ShareButton } from "@/components/resources/ShareButton";

interface FormPageShareBarProps {
  title: string;
  slug: string;
}

export function FormPageShareBar({ title, slug }: FormPageShareBarProps) {
  const formUrl = `/resources/forms/${slug}`;

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <ShareButton title={title} url={formUrl} variant="full" />
      <ShareButton title={title} url={formUrl} variant="whatsapp" />
      <ShareButton title={title} url={formUrl} variant="copy" />
    </div>
  );
}
