export type NativeFormFieldKind =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "address"
  | "fullName"
  | "file"
  | "signature";

export interface NativeFormField {
  qid: string;
  name: string;
  label: string;
  kind: NativeFormFieldKind;
  required: boolean;
  options?: string[];
  sensitive?: boolean;
  jotformType: string;
}

export interface NativeFormAttributionFields {
  sharedBy?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface NativeFormSchema {
  slug: string;
  title: string;
  description: string;
  jotformId: string;
  taskboardType: string;
  serviceType: string;
  fields: NativeFormField[];
  attributionFields: NativeFormAttributionFields;
}
