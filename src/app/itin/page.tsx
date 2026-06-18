import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { makeCanonical } from "@/lib/seo";

const NATIVE_ITIN_FORM_PATH = "/resources/forms/itin-registration-form";

export const metadata: Metadata = {
  title: "ITIN Application — IRS Certified Acceptance Agent",
  description:
    "Apply for your Individual Taxpayer Identification Number (ITIN). IRS Certified Acceptance Agent on-site — no mailing your passport. Fast processing for contractors and immigrant workers.",
  robots: { index: false, follow: false },
  alternates: { canonical: makeCanonical(NATIVE_ITIN_FORM_PATH) },
};

export default async function ItinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value) {
      query.set(key, value);
    }
  }

  const suffix = query.toString();
  redirect(suffix ? `${NATIVE_ITIN_FORM_PATH}?${suffix}` : NATIVE_ITIN_FORM_PATH);
}
