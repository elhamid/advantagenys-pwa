"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormErrorMessage } from "@/components/ui/FormErrorMessage";
import { useFormSendIdParam, useSharedByParam, useUtmParams } from "@/hooks/useUtmParams";
import { formStart, formSubmit } from "@/lib/analytics/events";
import { reportFormError, userFacingFormError } from "@/lib/error-reporting";
import type { NativeFormField, NativeFormSchema } from "@/lib/native-form-schemas/types";
import { preventImplicitFormSubmit } from "./preventImplicitFormSubmit";

interface GeneratedNativeFormProps {
  schema: NativeFormSchema;
}

interface UploadedDocumentRef {
  bucket: string;
  path: string;
  name: string;
  contentType: string;
  size: number;
  fieldQid: string;
  fieldLabel: string;
}

interface UploadItem {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "uploaded" | "error";
  error?: string;
  document?: UploadedDocumentRef;
}

const MAX_REQUEST_FILE_BYTES = 3.5 * 1024 * 1024;
const IMAGE_COMPRESSION_TARGET_BYTES = 1.25 * 1024 * 1024;
const IMAGE_COMPRESSION_MAX_DIMENSION = 1800;
const IMAGE_COMPRESSION_STEPS = [0.82, 0.72, 0.62, 0.52, 0.42];
const CURRENT_YEAR = new Date().getFullYear();
const DATE_YEARS = Array.from({ length: 141 }, (_, index) => CURRENT_YEAR + 20 - index);
const MONTH_OPTIONS = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
];
const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

const inputClasses =
  "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-accent)] focus:border-transparent transition-all";

function requiredMarker(required: boolean) {
  return required ? <span className="text-red-500">*</span> : null;
}

function FieldLabel({ field }: { field: NativeFormField }) {
  return (
    <label htmlFor={`field_${field.qid}`} className="block text-sm font-medium text-[var(--text)] mb-1">
      {field.label} {requiredMarker(field.required)}
    </label>
  );
}

function displayFileLabel(field: NativeFormField, schema: NativeFormSchema): string {
  if (schema.slug === "tax-return-questionnaire") {
    if (field.qid === "228") return "Upload mortgage interest, property tax, or 1098 documents";
    if (field.qid === "246") return "Take or upload a photo of mortgage/property tax documents";
    if (field.qid === "78") return "Take or upload a photo of any remaining tax document";
    if (field.qid === "168") return "Upload foreign bank account documents";
  }
  return field.label;
}

function isDateLikeField(field: NativeFormField): boolean {
  if (field.kind === "date") return true;
  const label = `${field.label} ${field.name}`.toLowerCase();
  return /\bdate\b|birthdate|expiration/.test(label);
}

function renderOptionField(field: NativeFormField, mode: "radio" | "checkbox") {
  const options = field.options && field.options.length > 0 ? field.options : ["Yes"];
  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-[var(--text)] mb-2">
        {field.label} {requiredMarker(field.required)}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => {
          const id = `field_${field.qid}_${option.replace(/[^a-z0-9]+/gi, "_")}`;
          return (
            <label
              key={option}
              htmlFor={id}
              className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text)]"
            >
              <input
                id={id}
                type={mode}
                name={`field_${field.qid}`}
                value={option}
                required={mode === "radio" ? field.required : undefined}
                className="mt-0.5 h-4 w-4 accent-[var(--blue-accent)]"
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function renderDateField(field: NativeFormField) {
  const key = `field_${field.qid}`;
  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-[var(--text)] mb-1">
        {field.label} {requiredMarker(field.required)}
      </legend>
      <input type="hidden" name={key} />
      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Month
          </span>
          <select name={`${key}_month`} required={field.required} aria-label={`${field.label} month`} className={inputClasses}>
            <option value="">Month</option>
            {MONTH_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Day
          </span>
          <select name={`${key}_day`} required={field.required} aria-label={`${field.label} day`} className={inputClasses}>
            <option value="">Day</option>
            {DAY_OPTIONS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Year
          </span>
          <select name={`${key}_year`} required={field.required} aria-label={`${field.label} year`} className={inputClasses}>
            <option value="">Year</option>
            {DATE_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Use Month / Day / Year, not DD/MM/YYYY. Example: June 23, 2026.
      </p>
    </fieldset>
  );
}

function renderFileField(
  schema: NativeFormSchema,
  field: NativeFormField,
  items: UploadItem[],
  onFilesSelected: (field: NativeFormField, files: FileList | null) => void,
  onRemove: (fieldQid: string, itemId: string) => void,
  uploadBlocked: boolean,
) {
  const label = displayFileLabel(field, schema);
  const uploadedCount = items.filter((item) => item.status === "uploaded").length;
  return (
    <div>
      <label htmlFor={`field_${field.qid}`} className="block text-sm font-medium text-[var(--text)] mb-1">
        {label} {requiredMarker(field.required)}
      </label>
      <label
        htmlFor={`field_${field.qid}`}
        className="block rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition-colors focus-within:border-[var(--blue-accent)] focus-within:ring-2 focus-within:ring-[var(--blue-accent)]/20"
      >
        <span className="block text-sm font-semibold text-[var(--text)]">Add files for this item</span>
        <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
          Accepted: PDF, Word, JPG, PNG, or WebP. Each file can be up to {fileSizeLabel(MAX_REQUEST_FILE_BYTES)}.
          Files upload here first; the final submit sends the completed packet.
        </span>
        <input
          id={`field_${field.qid}`}
          name={`field_${field.qid}`}
          type="file"
          required={field.required && uploadedCount === 0}
          multiple
          disabled={uploadBlocked}
          accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
          onChange={(event) => {
            onFilesSelected(field, event.currentTarget.files);
            event.currentTarget.value = "";
          }}
          className="mt-3 block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:rounded-[var(--radius)] file:border-0 file:bg-[var(--blue-accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:opacity-60"
        />
      </label>

      {items.length > 0 && (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-section)] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text)]">{item.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {fileSizeLabel(item.size)} · {item.status === "uploading" ? "Uploading..." : item.status === "uploaded" ? "Uploaded" : item.error}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(field.qid, item.id)}
                disabled={item.status === "uploading"}
                className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderField(
  schema: NativeFormSchema,
  field: NativeFormField,
  uploadItems: UploadItem[] = [],
  onFilesSelected?: (field: NativeFormField, files: FileList | null) => void,
  onRemove?: (fieldQid: string, itemId: string) => void,
  uploadBlocked = false,
) {
  if (field.hidden) return null;

  if (field.kind === "radio") return renderOptionField(field, "radio");
  if (field.kind === "checkbox") return renderOptionField(field, "checkbox");
  if (isDateLikeField(field)) return renderDateField(field);

  if (field.kind === "select") {
    return (
      <div>
        <FieldLabel field={field} />
        <select id={`field_${field.qid}`} name={`field_${field.qid}`} required={field.required} className={inputClasses}>
          <option value="">Select an option</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.kind === "textarea" || field.kind === "address") {
    return (
      <div>
        <FieldLabel field={field} />
        <textarea
          id={`field_${field.qid}`}
          name={`field_${field.qid}`}
          required={field.required}
          rows={field.kind === "address" ? 3 : 4}
          className={inputClasses}
        />
      </div>
    );
  }

  if (field.kind === "file") {
    return renderFileField(
      schema,
      field,
      uploadItems,
      onFilesSelected ?? (() => undefined),
      onRemove ?? (() => undefined),
      uploadBlocked,
    );
  }

  const inputType =
    field.kind === "email" ? "email" :
    field.kind === "tel" ? "tel" :
    field.kind === "number" ? "number" :
    "text";

  return (
    <div>
      <FieldLabel field={field} />
      <input
        id={`field_${field.qid}`}
        name={`field_${field.qid}`}
        type={inputType}
        required={field.required}
        className={inputClasses}
        autoComplete={field.kind === "email" ? "email" : field.kind === "tel" ? "tel" : field.kind === "fullName" ? "name" : undefined}
      />
    </div>
  );
}

function buildDateValue(month: string, day: string, year: string): string | null {
  if (!month && !day && !year) return "";
  if (!month || !day || !year) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return `${year}-${month}-${day}`;
}

function prepareDateFields(formData: FormData, schema: NativeFormSchema): void {
  for (const field of schema.fields.filter(isDateLikeField)) {
    const key = `field_${field.qid}`;
    const month = String(formData.get(`${key}_month`) ?? "");
    const day = String(formData.get(`${key}_day`) ?? "");
    const year = String(formData.get(`${key}_year`) ?? "");
    formData.delete(`${key}_month`);
    formData.delete(`${key}_day`);
    formData.delete(`${key}_year`);

    const value = buildDateValue(month, day, year);
    if (value === null) {
      throw new Error(`Choose a valid Month, Day, and Year for ${field.label}.`);
    }
    if (value) formData.set(key, value);
    else formData.delete(key);
  }
}

function fileSizeLabel(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`We could not read ${file.name}. Please upload a JPG, PNG, WebP, or PDF.`));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("We could not prepare the image upload. Please try a smaller photo."));
    }, type, quality);
  });
}

async function compressImageFile(file: File): Promise<File> {
  const image = await loadImage(file);
  const scale = Math.min(1, IMAGE_COMPRESSION_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("We could not prepare the image upload. Please try a smaller photo.");
  context.drawImage(image, 0, 0, width, height);

  let best: Blob | null = null;
  for (const quality of IMAGE_COMPRESSION_STEPS) {
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    best = blob;
    if (blob.size <= IMAGE_COMPRESSION_TARGET_BYTES) break;
  }

  if (!best) return file;
  return new File([best], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

async function prepareFileForUpload(file: File): Promise<File> {
  if (file.size <= MAX_REQUEST_FILE_BYTES) return file;

  if (file.type.startsWith("image/")) {
    const compressed = await compressImageFile(file);
    if (compressed.size <= MAX_REQUEST_FILE_BYTES) return compressed;
  }

  throw new Error(
    `${file.name} is too large (${fileSizeLabel(file.size)}). Please upload a smaller file or take a lower-resolution photo.`
  );
}

async function prepareUploadFiles(
  form: HTMLFormElement,
  formData: FormData,
  schema: NativeFormSchema,
  uploadedDocuments: Record<string, UploadItem[]>,
): Promise<void> {
  for (const field of schema.fields.filter((candidate) => candidate.kind === "file")) {
    const key = `field_${field.qid}`;
    const uploaded = (uploadedDocuments[field.qid] ?? [])
      .filter((item) => item.status === "uploaded" && item.document)
      .map((item) => item.document as UploadedDocumentRef);

    if (uploaded.length > 0) {
      formData.delete(key);
      formData.set(`${key}_uploaded_documents`, JSON.stringify(uploaded));
      continue;
    }

    const input = form.querySelector<HTMLInputElement>(`input[type="file"][name="${key}"]`);
    const files = Array.from(input?.files ?? []).filter((file) => file.size > 0);

    if (files.length === 0) continue;

    formData.delete(key);
    for (const file of files) {
      const prepared = await prepareFileForUpload(file);
      formData.append(key, prepared, prepared.name);
    }
  }
}

export function GeneratedNativeForm({ schema }: GeneratedNativeFormProps) {
  const utm = useUtmParams();
  const sharedBy = useSharedByParam();
  const formSendId = useFormSendIdParam();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadItemsByField, setUploadItemsByField] = useState<Record<string, UploadItem[]>>({});
  const startedRef = useRef(false);
  const visibleFields = schema.fields.filter((field) => !field.hidden);
  const uploadItems = Object.values(uploadItemsByField).flat();
  const uploadInProgress = uploadItems.some((item) => item.status === "uploading");
  const uploadHasError = uploadItems.some((item) => item.status === "error");
  const uploadedCount = uploadItems.filter((item) => item.status === "uploaded").length;

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    formStart("contact");
  }

  function removeUpload(fieldQid: string, itemId: string) {
    setUploadItemsByField((current) => ({
      ...current,
      [fieldQid]: (current[fieldQid] ?? []).filter((item) => item.id !== itemId),
    }));
  }

  function patchUploadItem(fieldQid: string, itemId: string, patch: Partial<UploadItem>) {
    setUploadItemsByField((current) => ({
      ...current,
      [fieldQid]: (current[fieldQid] ?? []).map((item) => (
        item.id === itemId ? { ...item, ...patch } : item
      )),
    }));
  }

  async function uploadPreparedFile(field: NativeFormField, file: File, itemId: string) {
    try {
      const prepared = await prepareFileForUpload(file);
      patchUploadItem(field.qid, itemId, { name: prepared.name, size: prepared.size });

      const uploadData = new FormData();
      uploadData.set("formSlug", schema.slug);
      uploadData.set("fieldQid", field.qid);
      uploadData.set("file", prepared, prepared.name);

      const res = await fetch("/api/native-form-upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json().catch(() => ({})) as {
        success?: boolean;
        error?: string;
        document?: UploadedDocumentRef;
      };
      if (!res.ok || !data.success || !data.document) {
        throw new Error(data.error || "Could not upload this file. Please try again.");
      }

      patchUploadItem(field.qid, itemId, {
        status: "uploaded",
        document: data.document,
        error: undefined,
      });
    } catch (err) {
      patchUploadItem(field.qid, itemId, {
        status: "error",
        error: userFacingFormError(err),
      });
      reportFormError(schema.slug, err, { formSlug: schema.slug, fieldQid: field.qid, uploadFile: file.name });
    }
  }

  function handleFilesSelected(field: NativeFormField, files: FileList | null) {
    const selected = Array.from(files ?? []).filter((file) => file.size > 0);
    if (selected.length === 0) return;

    const items = selected.map((file, index) => ({
      id: `${field.qid}-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
      name: file.name || field.label,
      size: file.size,
      status: "uploading" as const,
    }));

    setUploadItemsByField((current) => ({
      ...current,
      [field.qid]: [...(current[field.qid] ?? []), ...items],
    }));

    selected.forEach((file, index) => {
      void uploadPreparedFile(field, file, items[index].id);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("formSlug", schema.slug);
    if (sharedBy) formData.set("sharedBy", sharedBy);
    if (formSendId) formData.set("formSendId", formSendId);
    for (const [key, value] of Object.entries(utm)) {
      if (value) formData.set(key, value);
    }

    try {
      prepareDateFields(formData, schema);
      if (uploadInProgress) {
        throw new Error("Please wait for your documents to finish uploading before submitting.");
      }
      if (uploadHasError) {
        throw new Error("One or more documents did not upload. Remove the failed file or upload it again.");
      }
      await prepareUploadFiles(form, formData, schema, uploadItemsByField);
      const res = await fetch("/api/native-form-submit", {
        method: "POST",
        body: formData,
      });
      const responseText = await res.text();
      let data: { success?: boolean; error?: string } = {};
      try {
        data = responseText ? (JSON.parse(responseText) as { success?: boolean; error?: string }) : {};
      } catch {
        data = {};
      }
      if (!res.ok || !data.success) {
        if (res.status === 413) {
          throw new Error("The uploaded file is too large. Please upload a smaller file or take a lower-resolution photo.");
        }
        throw new Error(data.error || responseText.trim().slice(0, 200) || "Something went wrong. Please try again.");
      }

      formSubmit("contact");
      setSubmitted(true);
    } catch (err) {
      reportFormError(schema.slug, err, { formSlug: schema.slug });
      setError(userFacingFormError(err));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <div className="text-4xl mb-4 text-[var(--green)]">&#10003;</div>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">Form Received</h3>
        <p className="text-[var(--text-secondary)]">
          Your information has been received. Our team will review it and follow up.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        onFocus={handleFirstFocus}
        onKeyDown={preventImplicitFormSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-5">
          {visibleFields.map((field) => (
            <div key={field.qid}>
              {renderField(
                schema,
                field,
                uploadItemsByField[field.qid] ?? [],
                handleFilesSelected,
                removeUpload,
                loading,
              )}
            </div>
          ))}
        </div>

        {error && <FormErrorMessage error={error} />}
        {uploadedCount > 0 && (
          <p className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-section)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
            {uploadedCount} document{uploadedCount === 1 ? "" : "s"} uploaded securely. Submit the form to send the packet to our team.
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          <Button type="submit" disabled={loading || uploadInProgress} className="w-full sm:w-auto">
            {uploadInProgress ? "Uploading documents..." : loading ? "Submitting..." : "Submit Form"}
          </Button>
          <p className="text-xs text-[var(--text-muted)]">
            Sensitive identifiers are protected before they enter our CRM.
          </p>
        </div>
      </form>
    </Card>
  );
}
