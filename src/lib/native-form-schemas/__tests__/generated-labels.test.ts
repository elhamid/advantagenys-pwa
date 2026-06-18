import { describe, expect, it } from "vitest";
import { nativeFormSchemas } from "../generated";
import type { NativeFormSchema } from "../types";

const generatedLabelPattern = /^(input\d+|req\d+|typeA\d*)$/i;
const schemas = nativeFormSchemas as readonly NativeFormSchema[];

describe("generated native form labels", () => {
  it("does not expose internal generated field IDs to customers", () => {
    const visibleFields = schemas.flatMap((schema) =>
      schema.fields
        .filter((field) => !field.hidden)
        .map((field) => ({ schema: schema.slug, qid: field.qid, label: field.label }))
    );

    expect(
      visibleFields.filter((field) => generatedLabelPattern.test(field.label))
    ).toEqual([]);
  });

  it("never hides a required source field", () => {
    const hiddenRequiredFields = schemas.flatMap((schema) =>
      schema.fields
        .filter((field) => field.hidden && field.required)
        .map((field) => ({ schema: schema.slug, qid: field.qid, label: field.label }))
    );

    expect(hiddenRequiredFields).toEqual([]);
  });

  it("keeps contractor required business details visible with customer labels", () => {
    const contractor = schemas.find((schema) => schema.slug === "contractor-license-qualifier");
    const requiredBusinessLabels = contractor?.fields
      .filter((field) => ["34", "35", "36", "37", "40"].includes(field.qid))
      .map((field) => field.label);

    expect(requiredBusinessLabels).toEqual([
      "Legal business name",
      "Business address",
      "Business structure (LLC, corporation, or sole proprietor)",
      "Years of contractor or renovation experience",
      "Notes about missing license requirements or questions",
    ]);
  });
});
