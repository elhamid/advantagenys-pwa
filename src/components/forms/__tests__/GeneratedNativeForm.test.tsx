import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeneratedNativeForm } from "../GeneratedNativeForm";
import type { NativeFormSchema } from "@/lib/native-form-schemas/types";

vi.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/Card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/useUtmParams", () => ({
  useFormSendIdParam: () => null,
  useSharedByParam: () => null,
  useUtmParams: () => ({}),
}));

vi.mock("@/lib/analytics/events", () => ({
  formStart: vi.fn(),
  formSubmit: vi.fn(),
}));

const schema: NativeFormSchema = {
  slug: "itin-registration-form",
  title: "ITIN Registration Form",
  description: "Apply for ITIN",
  taskboardType: "itin-registration",
  serviceType: "ITIN",
  jotformId: "210224697492156",
  fields: [
    {
      qid: "13",
      name: "fullName",
      label: "First/Last Name",
      kind: "fullName",
      jotformType: "control_fullname",
      required: true,
    },
    {
      qid: "32",
      name: "phoneNumber",
      label: "Phone Number",
      kind: "tel",
      jotformType: "control_phone",
      required: true,
    },
    {
      qid: "29",
      name: "uploadCopy",
      label: "Upload a copy of your ID",
      kind: "file",
      jotformType: "control_fileupload",
      required: false,
    },
  ],
  attributionFields: {},
};

describe("GeneratedNativeForm upload guard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("blocks oversized files before the native submit request reaches Vercel", async () => {
    const user = userEvent.setup();
    render(<GeneratedNativeForm schema={schema} />);

    await user.type(screen.getByLabelText(/first\/last name/i), "David Jean Jr");
    await user.type(screen.getByLabelText(/phone number/i), "9295550101");
    await user.upload(
      screen.getByLabelText(/upload a copy/i),
      new File([new Uint8Array(5 * 1024 * 1024)], "passport.pdf", { type: "application/pdf" })
    );
    await user.click(screen.getByRole("button", { name: /submit form/i }));

    expect(await screen.findByText(/passport\.pdf is too large/i)).toBeInTheDocument();
    expect(screen.getByText(/upload a smaller file/i)).toBeInTheDocument();
    await waitFor(() => expect(fetch).not.toHaveBeenCalledWith("/api/native-form-submit", expect.anything()));
  });
});
