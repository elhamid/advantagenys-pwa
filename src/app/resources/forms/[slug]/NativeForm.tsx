"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { FormConfig } from "@/lib/forms";
import { getNativeFormSchema } from "@/lib/native-form-schemas/generated";
import { GeneratedNativeForm } from "@/components/forms/GeneratedNativeForm";

const nativeFormComponents: Record<string, ComponentType> = {
  ClientInfoForm: dynamic(
    () => import("@/components/forms/ClientInfoForm").then((mod) => mod.ClientInfoForm),
    { loading: () => <div className="py-12 text-center text-[var(--text-muted)]">Loading form...</div> }
  ),
  CorporateRegistrationForm: dynamic(
    () => import("@/components/forms/CorporateRegistrationForm").then((mod) => mod.CorporateRegistrationForm),
    { loading: () => <div className="py-12 text-center text-[var(--text-muted)]">Loading form...</div> }
  ),
  InsuranceForm: dynamic(
    () => import("@/components/forms/InsuranceForm").then((mod) => mod.InsuranceForm),
    { loading: () => <div className="py-12 text-center text-[var(--text-muted)]">Loading form...</div> }
  ),
  HomeImprovementForm: dynamic(
    () => import("@/components/forms/HomeImprovementForm").then((mod) => mod.HomeImprovementForm),
    { loading: () => <div className="py-12 text-center text-[var(--text-muted)]">Loading form...</div> }
  ),
  TaxReturnForm: dynamic(
    () => import("@/components/forms/TaxReturnForm").then((mod) => mod.TaxReturnForm),
    { loading: () => <div className="py-12 text-center text-[var(--text-muted)]">Loading form...</div> }
  ),
  ImmigrationPetitionerForm: dynamic(
    () => import("@/components/forms/ImmigrationPetitionerForm").then((mod) => mod.ImmigrationPetitionerForm),
    { loading: () => <div className="py-12 text-center text-[var(--text-muted)]">Loading form...</div> }
  ),
  ImmigrationBeneficiaryForm: dynamic(
    () => import("@/components/forms/ImmigrationBeneficiaryForm").then((mod) => mod.ImmigrationBeneficiaryForm),
    { loading: () => <div className="py-12 text-center text-[var(--text-muted)]">Loading form...</div> }
  ),
};

interface NativeFormProps {
  form: FormConfig;
}

export function NativeForm({ form }: NativeFormProps) {
  if (form.nativeComponent === "GeneratedNativeForm") {
    const schema = getNativeFormSchema(form.slug);
    if (!schema) {
      return (
        <div className="py-12 text-center text-[var(--text-muted)]">
          Form schema not available.
        </div>
      );
    }
    return <GeneratedNativeForm schema={schema} />;
  }

  const componentName = form.nativeComponent ?? "";
  const FormComponent = nativeFormComponents[componentName];

  if (!FormComponent) {
    return (
      <div className="py-12 text-center text-[var(--text-muted)]">
        Form not available.
      </div>
    );
  }

  return <FormComponent />;
}
