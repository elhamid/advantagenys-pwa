"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormErrorMessage } from "@/components/ui/FormErrorMessage";
import { useFormSendIdParam, useSharedByParam, useUtmParams } from "@/hooks/useUtmParams";
import { formStart, formSubmit } from "@/lib/analytics/events";
import { reportFormError, userFacingFormError } from "@/lib/error-reporting";
import type { NativeFormField, NativeFormSchema } from "@/lib/native-form-schemas/types";

interface GeneratedNativeFormProps {
  schema: NativeFormSchema;
}

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

function renderField(field: NativeFormField) {
  if (field.hidden) return null;

  if (field.kind === "radio") return renderOptionField(field, "radio");
  if (field.kind === "checkbox") return renderOptionField(field, "checkbox");

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
    return (
      <div>
        <FieldLabel field={field} />
        <input
          id={`field_${field.qid}`}
          name={`field_${field.qid}`}
          type="file"
          required={field.required}
          multiple
          accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
          className="block w-full rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--text-secondary)] file:mr-4 file:rounded-[var(--radius)] file:border-0 file:bg-[var(--blue-accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </div>
    );
  }

  const inputType =
    field.kind === "email" ? "email" :
    field.kind === "tel" ? "tel" :
    field.kind === "date" ? "date" :
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

export function GeneratedNativeForm({ schema }: GeneratedNativeFormProps) {
  const utm = useUtmParams();
  const sharedBy = useSharedByParam();
  const formSendId = useFormSendIdParam();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const visibleFields = schema.fields.filter((field) => !field.hidden);

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    formStart("contact");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("formSlug", schema.slug);
    if (sharedBy) formData.set("sharedBy", sharedBy);
    if (formSendId) formData.set("formSendId", formSendId);
    for (const [key, value] of Object.entries(utm)) {
      if (value) formData.set(key, value);
    }

    try {
      const res = await fetch("/api/native-form-submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
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
      <form onSubmit={handleSubmit} onFocus={handleFirstFocus} className="space-y-6">
        <div className="grid grid-cols-1 gap-5">
          {visibleFields.map((field) => (
            <div key={field.qid}>{renderField(field)}</div>
          ))}
        </div>

        {error && <FormErrorMessage error={error} />}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Submitting..." : "Submit Form"}
          </Button>
          <p className="text-xs text-[var(--text-muted)]">
            Sensitive identifiers are protected before they enter our CRM.
          </p>
        </div>
      </form>
    </Card>
  );
}
