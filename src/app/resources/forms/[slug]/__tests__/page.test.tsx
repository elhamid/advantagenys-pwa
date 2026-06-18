import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import FormPage, { generateMetadata, generateStaticParams } from "../page";
import { FormPageShareBar } from "../FormPageShareBar";
import { NativeForm } from "../NativeForm";

const nativeForm = {
  slug: "native-intake",
  title: "Native Intake",
  description: "Native intake description",
  active: true,
  type: "form",
  platform: "native",
  nativeComponent: "ClientInfoForm",
} as const;

const jotform = {
  slug: "jotform-intake",
  id: "abc123",
  title: "JotForm Intake",
  description: "JotForm description",
  active: true,
  type: "form",
  platform: "jotform",
  embedUrl: "https://form.jotform.com/abc123",
} as const;

const inactiveNative = {
  ...nativeForm,
  slug: "inactive",
  title: "Inactive Intake",
  active: false,
} as const;

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/resources/ShareButton", () => ({
  ShareButton: ({
    title,
    url,
    variant,
  }: {
    title: string;
    url: string;
    variant: string;
  }) => (
    <button type="button" data-testid={`share-${variant}`}>
      {title}:{url}
    </button>
  ),
}));

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

vi.mock("@/lib/forms", () => ({
  forms: [
    { slug: "native-intake", active: true, type: "form" },
    { slug: "generated-native", active: true, type: "form" },
    { slug: "jotform-intake", active: true, type: "form" },
    { slug: "link-only", active: true, type: "link" },
    { slug: "inactive", active: false, type: "form" },
  ],
  getFormBySlug: vi.fn((slug: string) => {
    if (slug === "native-intake") return nativeForm;
    if (slug === "generated-native") {
      return {
        ...nativeForm,
        slug: "generated-native",
        title: "Generated Native",
        nativeComponent: "GeneratedNativeForm",
      };
    }
    if (slug === "jotform-intake") return jotform;
    if (slug === "inactive") return inactiveNative;
    return null;
  }),
}));

beforeEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Resource form route", () => {
  it("generates static params for active non-link forms", async () => {
    expect(await generateStaticParams()).toEqual([{ slug: "native-intake" }, { slug: "generated-native" }, { slug: "jotform-intake" }]);
  });

  it("generates metadata for a known form slug", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "native-intake" }) });

    expect(metadata.title).toBe("Native Intake");
    expect(metadata.description).toBe("Native intake description");
  });

  it("returns a fallback metadata title for unknown forms", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "missing" }) });

    expect(metadata.title).toBe("Form Not Found");
  });

  it("returns fallback metadata for inactive forms", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "inactive" }) });

    expect(metadata.title).toBe("Form Not Found");
  });

  it("renders the native form branch", async () => {
    const jsx = await FormPage({ params: Promise.resolve({ slug: "native-intake" }) });
    render(jsx);

    expect(screen.getByRole("heading", { name: /native intake/i })).toBeInTheDocument();
    expect(screen.getByText(/after you submit/i)).toBeInTheDocument();
    expect(screen.getByText(/staff review packet/i)).toBeInTheDocument();
    expect(screen.getByTestId("native-form-component")).toBeInTheDocument();
    expect(screen.getByTestId("share-full")).toHaveTextContent("/resources/forms/native-intake");
    expect(screen.getByTestId("share-whatsapp")).toBeInTheDocument();
    expect(screen.getByTestId("share-copy")).toBeInTheDocument();
  });

  it("renders the JotForm embed branch", async () => {
    const handler = vi.fn();
    Object.defineProperty(window, "jotformEmbedHandler", {
      configurable: true,
      writable: true,
      value: handler,
    });

    const jsx = await FormPage({ params: Promise.resolve({ slug: "jotform-intake" }) });
    const { unmount } = render(jsx);

    const iframe = screen.getByTitle("JotForm Intake");
    expect(iframe).toHaveAttribute("src", "https://form.jotform.com/abc123");
    expect(iframe).toHaveAttribute("id", "JotFormIFrame-abc123");

    const script = document.body.querySelector('script[src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"]') as HTMLScriptElement | null;
    expect(script).toBeInTheDocument();
    script?.onload?.(new Event("load"));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith('iframe[id="JotFormIFrame-abc123"]', "https://form.jotform.com/");
    });

    unmount();
    expect(document.body.querySelector('script[src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"]')).toBeNull();
  });

  it("does not render inactive direct form slugs", async () => {
    await expect(FormPage({ params: Promise.resolve({ slug: "inactive" }) })).rejects.toThrow("NOT_FOUND");
  });

  it("renders the FormPageShareBar variants", () => {
    render(<FormPageShareBar title="Native Intake" slug="native-intake" />);

    expect(screen.getByTestId("share-full")).toBeInTheDocument();
    expect(screen.getByTestId("share-whatsapp")).toBeInTheDocument();
    expect(screen.getByTestId("share-copy")).toBeInTheDocument();
  });

  it("renders the NativeForm fallback and selected component", () => {
    const { rerender } = render(<NativeForm form={nativeForm as never} />);

    expect(screen.getByTestId("native-form-component")).toBeInTheDocument();

    rerender(<NativeForm form={{ ...nativeForm, nativeComponent: "GeneratedNativeForm", slug: "generated-native" } as never} />);
    expect(screen.getByTestId("generated-native-form")).toBeInTheDocument();

    rerender(<NativeForm form={{ ...nativeForm, nativeComponent: "UnknownComponent" } as never} />);
    expect(screen.getByText(/form not available/i)).toBeInTheDocument();
  });
});
