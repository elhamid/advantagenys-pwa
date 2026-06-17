import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NativeForm } from "../NativeForm";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="native-form-component">Native form</div>,
}));

vi.mock("@/components/forms/GeneratedNativeForm", () => ({
  GeneratedNativeForm: () => <div data-testid="generated-native-form">Generated native form</div>,
}));

vi.mock("@/lib/native-form-schemas/generated", () => ({
  getNativeFormSchema: vi.fn((slug: string) => (
    slug === "generated-native"
      ? { slug, title: "Generated Native", description: "", jotformId: "123", taskboardType: "generated", serviceType: "Tax Services", fields: [], attributionFields: {} }
      : undefined
  )),
}));

const baseForm = {
  id: "native-test",
  slug: "native-test",
  title: "Native Test",
  description: "Native form",
  category: "tax",
  platform: "native",
  active: true,
  priority: 1,
  nativeComponent: "ClientInfoForm",
} as const;

describe("NativeForm", () => {
  it("renders the configured native component", () => {
    render(<NativeForm form={baseForm as never} />);

    expect(screen.getByTestId("native-form-component")).toBeInTheDocument();
  });

  it("renders the generated native component when a schema is configured", () => {
    render(<NativeForm form={{ ...baseForm, slug: "generated-native", nativeComponent: "GeneratedNativeForm" } as never} />);

    expect(screen.getByTestId("generated-native-form")).toBeInTheDocument();
  });

  it("renders the fallback when the component name is unknown", () => {
    render(<NativeForm form={{ ...baseForm, nativeComponent: "UnknownComponent" } as never} />);

    expect(screen.getByText(/form not available/i)).toBeInTheDocument();
  });
});
