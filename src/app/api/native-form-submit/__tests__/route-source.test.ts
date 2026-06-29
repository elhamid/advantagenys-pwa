import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { POST } from "../route";

const ROUTE_SOURCE = readFileSync(
  join(process.cwd(), "src/app/api/native-form-submit/route.ts"),
  "utf8",
);
const LEGACY_ITIN_STORAGE_SOURCE = readFileSync(
  join(process.cwd(), "src/lib/itin-storage.ts"),
  "utf8",
);

describe("native-form-submit source contract", () => {
  it("rejects sensitive native submissions when the privacy acknowledgement is bypassed", async () => {
    const formData = new FormData();
    formData.set("formSlug", "itin-registration-form");

    const response = await POST(
      new Request("http://localhost/api/native-form-submit", {
        method: "POST",
        body: formData,
      }) as Parameters<typeof POST>[0],
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: "Please acknowledge the sensitive information notice before submitting.",
    });
  });

  it("preserves duplicate upload labels in the document manifest", () => {
    expect(ROUTE_SOURCE).toContain("function uniqueDocumentKey");
    expect(ROUTE_SOURCE).toContain("uniqueDocumentKey(documentUrls, field.label, field.qid)");
    expect(ROUTE_SOURCE).not.toContain("documentUrls[field.label] = urls");
  });

  it("enforces the sensitive-form acknowledgement server-side", () => {
    expect(ROUTE_SOURCE).toContain("function requiresSensitiveConsent");
    expect(ROUTE_SOURCE).toContain('getString(formData, "privacyConsent") !== "yes"');
    expect(ROUTE_SOURCE).toContain("Please acknowledge the sensitive information notice before submitting.");
  });

  it("stores native upload manifests as private storage refs, not public ITIN URLs", () => {
    expect(ROUTE_SOURCE).toContain('const DOCUMENT_BUCKET = process.env.FORM_DOCUMENTS_BUCKET || "form-documents"');
    expect(ROUTE_SOURCE).toContain("ensurePrivateUploadBucket");
    expect(ROUTE_SOURCE).toContain("Document upload bucket is public. Refusing to store sensitive form documents.");
    expect(ROUTE_SOURCE).toContain("bucket: DOCUMENT_BUCKET");
    expect(ROUTE_SOURCE).not.toContain('"itin-documents"');
    expect(ROUTE_SOURCE).not.toContain("getPublicUrl");
  });

  it("sends full staff answers to Taskboard instead of masked service packets", () => {
    expect(ROUTE_SOURCE).toContain("const staffAnswers = answerRecord(answers, false)");
    expect(ROUTE_SOURCE).toContain("answers: staffAnswers");
    expect(ROUTE_SOURCE).toContain("Sensitive answers are stored only in authenticated Taskboard intake records");
    expect(ROUTE_SOURCE).not.toContain("Sensitive answers are masked before taskboard/CRM storage");
  });

  it("keeps retired legacy ITIN storage fail-closed", () => {
    expect(LEGACY_ITIN_STORAGE_SOURCE).toContain("Legacy ITIN document storage is retired.");
    expect(LEGACY_ITIN_STORAGE_SOURCE).toContain("refusing document upload");
    expect(LEGACY_ITIN_STORAGE_SOURCE).not.toContain("createClient");
    expect(LEGACY_ITIN_STORAGE_SOURCE).not.toContain('"itin-documents"');
    expect(LEGACY_ITIN_STORAGE_SOURCE).not.toContain("getPublicUrl");
  });
});
