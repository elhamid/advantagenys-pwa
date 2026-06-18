import { describe, expect, it } from "vitest";
import {
  PWA_BACKUP_ECHO_MARKER,
  answerRecord,
  buildJotFormParams,
  buildNativeAnswers,
  extractNativeContact,
  maskSensitiveValue,
} from "../answers";
import type { NativeFormSchema } from "../types";

const schema: NativeFormSchema = {
  slug: "test-native",
  title: "Test Native",
  description: "Test",
  jotformId: "123456789012",
  taskboardType: "tax-return",
  serviceType: "Tax Services",
  attributionFields: {
    sharedBy: "90",
    utmSource: "91",
    utmMedium: "92",
    utmCampaign: "93",
  },
  fields: [
    {
      qid: "1",
      name: "fullName",
      label: "Name",
      kind: "fullName",
      required: true,
      jotformType: "control_fullname",
    },
    {
      qid: "2",
      name: "phone",
      label: "Phone Number",
      kind: "tel",
      required: true,
      jotformType: "control_phone",
    },
    {
      qid: "3",
      name: "email",
      label: "Email",
      kind: "email",
      required: false,
      jotformType: "control_email",
    },
    {
      qid: "4",
      name: "ssn",
      label: "Social Security #",
      kind: "text",
      required: true,
      sensitive: true,
      jotformType: "control_textbox",
    },
  ],
};

describe("native form answers", () => {
  it("masks sensitive values for CRM/taskboard records", () => {
    expect(maskSensitiveValue("123-45-6789")).toBe("[sensitive ending 6789]");
    expect(maskSensitiveValue("1990-01-31", { label: "Date of Birth", kind: "date" })).toBe("[date provided]");
  });

  it("builds masked taskboard answers while retaining raw values for mirror params", () => {
    const answers = buildNativeAnswers(schema, {
      "1": "Jane Client",
      "2": "(929) 555-0101",
      "3": "jane@example.com",
      "4": "123-45-6789",
    });

    expect(extractNativeContact(answers)).toEqual({
      fullName: "Jane Client",
      phone: "(929) 555-0101",
      email: "jane@example.com",
    });

    expect(answerRecord(answers, true)).toMatchObject({
      fullName: "Jane Client",
      phone: "(929) 555-0101",
      email: "jane@example.com",
      ssn: "[sensitive ending 6789]",
    });
    expect(answerRecord(answers, false).ssn).toBe("123-45-6789");
  });

  it("treats signatures and sensitive-looking labels as sensitive even without schema flags", () => {
    const localSchema: NativeFormSchema = {
      ...schema,
      fields: [
        ...schema.fields,
        {
          qid: "5",
          name: "signature",
          label: "Filer Signature",
          kind: "signature",
          required: true,
          jotformType: "control_signature",
        },
        {
          qid: "6",
          name: "businessEin",
          label: "Business Tax ID (EIN)",
          kind: "text",
          required: true,
          jotformType: "control_textbox",
        },
      ],
    };

    const answers = buildNativeAnswers(localSchema, {
      "1": "Jane Client",
      "2": "(929) 555-0101",
      "4": "123-45-6789",
      "5": "Jane Signature",
      "6": "12-3456789",
    });

    expect(answerRecord(answers, true)).toMatchObject({
      signature: "[sensitive provided]",
      businessEin: "[sensitive ending 6789]",
    });
    expect(answerRecord(answers, false)).toMatchObject({
      signature: "Jane Signature",
      businessEin: "12-3456789",
    });
  });

  it("keeps duplicate generated field names by suffixing the qid", () => {
    const localSchema: NativeFormSchema = {
      ...schema,
      fields: [
        {
          qid: "10",
          name: "ifYes168",
          label: "If yes, describe the first record",
          kind: "text",
          required: false,
          jotformType: "control_textbox",
        },
        {
          qid: "11",
          name: "ifYes168",
          label: "If yes, describe the second record",
          kind: "text",
          required: false,
          jotformType: "control_textbox",
        },
      ],
    };

    const answers = buildNativeAnswers(localSchema, {
      "10": "first duplicate answer",
      "11": "second duplicate answer",
    });

    expect(answerRecord(answers, true)).toEqual({
      ifYes168: "first duplicate answer",
      ifYes168_11: "second duplicate answer",
    });
  });

  it("adds the backup marker and attribution fields to JotForm mirror params", () => {
    const answers = buildNativeAnswers(schema, {
      "1": "Jane Client",
      "2": "(929) 555-0101",
      "4": "123-45-6789",
    });
    const params = buildJotFormParams({
      schema,
      answers,
      sharedBy: "staff-123",
      formSendId: "send-123",
      utm: {
        utm_source: "advantageos",
        utm_medium: "staff_share",
        utm_campaign: "form_share",
      },
    });

    expect(params.get("submission[1_first]")).toBe("Jane");
    expect(params.get("submission[1_last]")).toBe("Client");
    expect(params.get("submission[2_full]")).toBe("9295550101");
    expect(params.get("submission[4]")).toBe("123-45-6789");
    expect(params.get("submission[90]")).toContain(PWA_BACKUP_ECHO_MARKER);
    expect(params.get("submission[90]")).toContain("send_id=send-123");
    expect(params.get("submission[91]")).toBe("advantageos");
  });
});
