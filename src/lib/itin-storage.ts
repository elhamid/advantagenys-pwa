/**
 * Legacy ITIN document storage is retired.
 *
 * Active ITIN uploads go through /api/native-form-submit, which stores private
 * storage refs in the Taskboard form-documents bucket. These exports remain only
 * so stale server imports fail closed instead of writing public document URLs.
 */

type LegacyItinDocumentType = "passport" | "selfie" | "signature";

export async function uploadItinDocument(
  _file: Buffer,
  _filename: string,
  _phone: string,
  _type: LegacyItinDocumentType,
  _contentType: string,
): Promise<string | null> {
  void _file;
  void _filename;
  void _phone;
  void _type;
  void _contentType;
  console.warn("[itin-storage] Legacy ITIN storage is retired; refusing document upload.");
  return null;
}

export async function uploadMultipleItinDocuments(
  documents: Array<{
    file: Buffer;
    filename: string;
    type: LegacyItinDocumentType;
    contentType: string;
  }>,
  _phone: string,
): Promise<Record<LegacyItinDocumentType, string | null>> {
  void _phone;
  if (documents.length > 0) {
    console.warn("[itin-storage] Legacy ITIN storage is retired; refusing document uploads.");
  }

  return {
    passport: null,
    selfie: null,
    signature: null,
  };
}
