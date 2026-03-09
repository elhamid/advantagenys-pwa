"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

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
};

interface NativeFormProps {
  componentName: string;
}

export function NativeForm({ componentName }: NativeFormProps) {
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
