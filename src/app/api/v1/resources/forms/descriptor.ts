import { forms, type FormConfig } from "@/lib/forms";
import { BASE_URL } from "@/lib/seo";

/** Shape returned to taskboard/other consumers — intentionally stable. */
export type PublicFormDescriptor = {
  slug: string;
  title: string;
  description: string;
  category: FormConfig["category"];
  publicUrl: string;
  shortUrl: string | null;
  whatsappText: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  ogImage: string | null;
  active: true;
};

export function toPublicDescriptor(f: FormConfig): PublicFormDescriptor {
  const publicUrl = f.type === "link" && f.linkUrl ? f.linkUrl : `${BASE_URL}/resources/forms/${f.slug}`;
  const shortUrl = f.shortLinkSlug ? `${BASE_URL}/r/${f.shortLinkSlug}` : null;
  return {
    slug: f.slug,
    title: f.title,
    description: f.description,
    category: f.category,
    publicUrl,
    shortUrl,
    whatsappText: f.whatsappText ?? null,
    emailSubject: f.emailSubject ?? null,
    emailBody: f.emailBody ?? null,
    ogImage: f.ogImage ?? null,
    active: true,
  };
}

export function activePublicForms(): PublicFormDescriptor[] {
  return forms
    .filter((f) => f.active)
    .sort((a, b) => a.priority - b.priority)
    .map(toPublicDescriptor);
}
