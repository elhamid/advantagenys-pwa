import { NextRequest, NextResponse } from "next/server";
import { getNativeFormSchema } from "@/lib/native-form-schemas/generated";
import { uploadNativeDocument } from "@/lib/native-form-document-storage";

export const runtime = "nodejs";

function getString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid upload." }, { status: 400 });
  }

  const slug = getString(formData, "formSlug");
  const fieldQid = getString(formData, "fieldQid");
  const file = formData.get("file");

  if (!slug || !fieldQid) {
    return NextResponse.json({ success: false, error: "Missing upload context." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ success: false, error: "Choose a file to upload." }, { status: 400 });
  }

  const schema = getNativeFormSchema(slug);
  const field = schema?.fields.find((candidate) => candidate.qid === fieldQid && candidate.kind === "file");
  if (!schema || !field) {
    return NextResponse.json({ success: false, error: "Unknown upload field." }, { status: 404 });
  }

  try {
    const document = await uploadNativeDocument({
      schema,
      field,
      file,
      phone: getString(formData, "phone"),
    });
    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (err) {
    console.error("[native-form-upload] upload failed", {
      form: slug,
      field: fieldQid,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Could not upload this file. Please try again." },
      { status: 400 }
    );
  }
}
