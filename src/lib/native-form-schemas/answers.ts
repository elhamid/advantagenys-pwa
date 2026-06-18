import type { NativeFormField, NativeFormSchema } from "./types";
import { englishInputError, normalizeEnglishValue } from "@/lib/forms/english-normalization";

export const PWA_BACKUP_ECHO_MARKER = "Backup copy from advantagenys.com";

export interface NativeAnswer {
  qid: string;
  name: string;
  label: string;
  kind: NativeFormField["kind"];
  value: string | string[];
  maskedValue: string | string[];
  sensitive: boolean;
}

export interface NativeContactFields {
  fullName: string;
  phone: string;
  email?: string;
}

const SENSITIVE_LABEL_PATTERN = /\b(ssn|social security|itin|tax id|taxid|ein|passport|visa|alien|a-number|anumber|routing|account|bank|birth date|date of birth|dob|signature|id number|driver.?s license)\b/i;
const LEGAL_NAME_LABEL_PATTERN = /\b(first\/last name|full legal name|legal name|first name|last name|middle name|applicant name|petitioner.*name|beneficiary.*name|spouse.*name|father.*name|mother.*name|child.*name|owner name|business name|company name|corporation name|entity name)\b/i;

function valueToString(value: string | string[]): string {
  return Array.isArray(value) ? value.join(", ").trim() : value.trim();
}

export function answerIsEmpty(value: string | string[]): boolean {
  return Array.isArray(value) ? value.length === 0 : value.trim().length === 0;
}

function isSensitiveField(field: Pick<NativeFormField, "label" | "kind" | "sensitive">): boolean {
  if (field.sensitive === true) return true;
  if (field.kind === "signature") return true;
  return SENSITIVE_LABEL_PATTERN.test(field.label);
}

function requiresTypedEnglishName(field: Pick<NativeFormField, "label" | "name" | "kind">): boolean {
  if (field.kind === "fullName") return true;
  return LEGAL_NAME_LABEL_PATTERN.test(`${field.name} ${field.label}`);
}

function normalizeFieldValue(
  field: Pick<NativeFormField, "label" | "name" | "kind">,
  value: string | string[],
): string | string[] {
  return normalizeEnglishValue(value, { stripDiacritics: !requiresTypedEnglishName(field) });
}

export function maskSensitiveValue(value: string | string[], field?: Pick<NativeFormField, "label" | "kind">): string | string[] {
  if (Array.isArray(value)) {
    return value.map((item) => maskSensitiveValue(item, field) as string);
  }

  const trimmed = value.trim();
  if (!trimmed) return "";

  const label = field?.label.toLowerCase() ?? "";
  if (field?.kind === "date" || label.includes("date of birth") || label.includes("birth date") || label.includes("birthdate")) {
    return "[date provided]";
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 4) {
    return `[sensitive ending ${digits.slice(-4)}]`;
  }

  return "[sensitive provided]";
}

export function buildNativeAnswers(
  schema: NativeFormSchema,
  values: Record<string, string | string[]>,
  uploadedFileUrls: Record<string, string | string[] | undefined> = {},
): NativeAnswer[] {
  return schema.fields.flatMap((field) => {
    const raw = uploadedFileUrls[field.qid] ?? values[field.qid] ?? "";
    const value = normalizeFieldValue(field, raw);
    if (answerIsEmpty(value)) return [];

    const sensitive = isSensitiveField(field);
    return [{
      qid: field.qid,
      name: field.name,
      label: field.label,
      kind: field.kind,
      value,
      maskedValue: sensitive ? maskSensitiveValue(value, field) : value,
      sensitive,
    }];
  });
}

export function answerRecord(answers: NativeAnswer[], masked = true): Record<string, string | string[]> {
  const record: Record<string, string | string[]> = {};
  for (const answer of answers) {
    const baseKey = answer.name || answer.label || answer.qid;
    const key = record[baseKey] === undefined ? baseKey : `${baseKey}_${answer.qid}`;
    const value = masked ? answer.maskedValue : answer.value;
    if (!answerIsEmpty(value)) record[key] = value;
  }
  return record;
}

export function extractNativeContact(answers: NativeAnswer[]): NativeContactFields | null {
  const fullNameAnswer =
    answers.find((answer) => answer.kind === "fullName") ??
    answers.find((answer) => /name/i.test(answer.label));
  const phoneAnswer =
    answers.find((answer) => answer.kind === "tel") ??
    answers.find((answer) => /phone|cell|mobile/i.test(answer.label));
  const emailAnswer =
    answers.find((answer) => answer.kind === "email") ??
    answers.find((answer) => /email/i.test(answer.label));

  const fullName = fullNameAnswer ? valueToString(fullNameAnswer.value) : "";
  const phone = phoneAnswer ? valueToString(phoneAnswer.value) : "";
  const email = emailAnswer ? valueToString(emailAnswer.value) : "";

  if (!fullName || !phone) return null;

  return {
    fullName,
    phone,
    email: email || undefined,
  };
}

export function collectFormDataValues(
  formData: FormData,
  schema: NativeFormSchema,
): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};

  for (const field of schema.fields) {
    const key = `field_${field.qid}`;
    const entries = formData
      .getAll(key)
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (entries.length === 0) continue;
    values[field.qid] = field.kind === "checkbox" ? normalizeFieldValue(field, entries) : normalizeFieldValue(field, entries[0]!);
  }

  return values;
}

export function nativeEnglishInputErrors(
  schema: NativeFormSchema,
  values: Record<string, string | string[]>,
): string[] {
  return schema.fields.flatMap((field) => {
    if (field.kind === "file" || field.kind === "signature") return [];
    const value = values[field.qid];
    if (!value || answerIsEmpty(value)) return [];
    const error = englishInputError(value, field.label, {
      requireBasicEnglishLetters: requiresTypedEnglishName(field),
    });
    return error ? [error] : [];
  });
}

export function buildJotFormParams(args: {
  schema: NativeFormSchema;
  answers: NativeAnswer[];
  sharedBy?: string;
  formSendId?: string;
  utm?: Record<string, string | undefined>;
}): URLSearchParams {
  const { schema, answers, sharedBy, formSendId, utm } = args;
  const params = new URLSearchParams();

  for (const answer of answers) {
    const field = schema.fields.find((candidate) => candidate.qid === answer.qid);
    if (!field) continue;
    appendJotFormAnswer(params, field, answer.value);
  }

  const marker = [
    PWA_BACKUP_ECHO_MARKER,
    sharedBy ? `shared_by=${sharedBy}` : null,
    formSendId ? `send_id=${formSendId}` : null,
  ].filter(Boolean).join(" | ");

  if (schema.attributionFields.sharedBy) {
    params.append(`submission[${schema.attributionFields.sharedBy}]`, marker);
  } else {
    params.append("submission[backup_marker]", marker);
  }

  if (schema.attributionFields.utmSource && utm?.utm_source) {
    params.append(`submission[${schema.attributionFields.utmSource}]`, utm.utm_source);
  }
  if (schema.attributionFields.utmMedium && utm?.utm_medium) {
    params.append(`submission[${schema.attributionFields.utmMedium}]`, utm.utm_medium);
  }
  if (schema.attributionFields.utmCampaign && utm?.utm_campaign) {
    params.append(`submission[${schema.attributionFields.utmCampaign}]`, utm.utm_campaign);
  }

  return params;
}

function appendJotFormAnswer(
  params: URLSearchParams,
  field: NativeFormField,
  value: string | string[],
): void {
  if (answerIsEmpty(value)) return;

  if (field.kind === "fullName") {
    const text = valueToString(value);
    const [first, ...rest] = text.split(/\s+/).filter(Boolean);
    params.append(`submission[${field.qid}_first]`, first ?? text);
    params.append(`submission[${field.qid}_last]`, rest.join(" "));
    return;
  }

  if (field.kind === "tel") {
    params.append(`submission[${field.qid}_full]`, valueToString(value).replace(/[^\d+]/g, ""));
    return;
  }

  if (field.kind === "date") {
    const text = valueToString(value);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      params.append(`submission[${field.qid}_month]`, match[2]);
      params.append(`submission[${field.qid}_day]`, match[3]);
      params.append(`submission[${field.qid}_year]`, match[1]);
      return;
    }
  }

  if (field.kind === "address") {
    params.append(`submission[${field.qid}_addr_line1]`, valueToString(value));
    return;
  }

  params.append(`submission[${field.qid}]`, valueToString(value));
}
