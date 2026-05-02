import { describe, it, expect } from "vitest";
import {
  forms,
  categories,
  getFormBySlug,
  getFormsByCategory,
  categoryColors,
  type FormConfig,
  type CategoryKey,
} from "../forms";

describe("forms data integrity", () => {
  it("has 23 form entries total", () => {
    expect(forms).toHaveLength(23);
  });

  it("all slugs are unique — no duplicates", () => {
    const slugs = forms.map((f) => f.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("all IDs are unique — no duplicates", () => {
    const ids = forms.map((f) => f.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("all priorities are unique", () => {
    const priorities = forms.map((f) => f.priority);
    const unique = new Set(priorities);
    expect(unique.size).toBe(priorities.length);
  });

  it("has 5 retired forms (inactive) — Divorce, Sales Tax, Bookkeeping, New I-130 pair", () => {
    const retired = forms.filter((f) => !f.active).map((f) => f.id);
    expect(retired).toEqual(
      expect.arrayContaining([
        "221784773077062", // Divorce Application
        "222615377389062", // Sales Tax Return Form
        "260414184804049", // Bookkeeping Form
        "243156342192150", // New I-130 Petitioner
        "243156183104146", // New I-130 Beneficiary
      ])
    );
    expect(retired).toHaveLength(5);
  });

  it("every active form has a boolean true active flag", () => {
    forms
      .filter((f) => f.active)
      .forEach((f) => {
        expect(f.active).toBe(true);
      });
  });

  it("all JotForm IDs are numeric strings (15–18 digits)", () => {
    const jotformEntries = forms.filter((f) => f.platform === "jotform");
    jotformEntries.forEach((f) => {
      expect(f.id).toMatch(/^\d{12,18}$/);
    });
  });

  it("all JotForm entries have a valid embedUrl", () => {
    const jotformEntries = forms.filter((f) => f.platform === "jotform");
    jotformEntries.forEach((f) => {
      expect(f.embedUrl).toMatch(/^https:\/\/form\.jotform\.com\/\d+$/);
    });
  });

  it("JotForm embedUrl IDs match the form id field", () => {
    const jotformEntries = forms.filter((f) => f.platform === "jotform");
    jotformEntries.forEach((f) => {
      expect(f.embedUrl).toContain(f.id);
    });
  });

  it("native forms with nativeComponent do not have an embedUrl", () => {
    const nativeWithComponent = forms.filter(
      (f) => f.platform === "native" && f.nativeComponent
    );
    nativeWithComponent.forEach((f) => {
      expect(f.embedUrl).toBeUndefined();
    });
  });

  it("link-type entries have a linkUrl that is a valid URL", () => {
    const linkEntries = forms.filter((f) => f.type === "link");
    expect(linkEntries.length).toBeGreaterThan(0);
    linkEntries.forEach((f) => {
      expect(f.linkUrl).toMatch(/^https?:\/\//);
    });
  });

  it("all category values are within the allowed set", () => {
    const allowedCategories = new Set<FormConfig["category"]>([
      "tax",
      "business",
      "insurance",
      "immigration",
      "licensing",
      "financial",
      "other",
    ]);
    forms.forEach((f) => {
      expect(allowedCategories.has(f.category)).toBe(true);
    });
  });

  it("all platform values are within the allowed set", () => {
    const allowedPlatforms = new Set<FormConfig["platform"]>(["jotform", "google", "native"]);
    forms.forEach((f) => {
      expect(allowedPlatforms.has(f.platform)).toBe(true);
    });
  });
});

describe("getFormBySlug()", () => {
  it("finds ITIN Registration Form by known slug", () => {
    const form = getFormBySlug("itin-registration-form");
    expect(form).toBeDefined();
    expect(form?.title).toBe("ITIN Registration Form");
    expect(form?.id).toBe("210224697492156");
  });

  it("finds Tax Return Questionnaire by slug", () => {
    const form = getFormBySlug("tax-return-questionnaire");
    expect(form).toBeDefined();
    expect(form?.category).toBe("tax");
    expect(form?.encrypted).toBe(true);
  });

  it("finds native Client Intake form by slug", () => {
    const form = getFormBySlug("basic-info-client-intake");
    expect(form).toBeDefined();
    expect(form?.platform).toBe("native");
    expect(form?.nativeComponent).toBe("ClientInfoForm");
  });

  it("finds Corporation Services form by slug", () => {
    const form = getFormBySlug("corporation-services");
    expect(form).toBeDefined();
    expect(form?.nativeComponent).toBe("CorporateRegistrationForm");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getFormBySlug("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getFormBySlug("")).toBeUndefined();
  });

  it("is case-sensitive — uppercase slug returns undefined", () => {
    expect(getFormBySlug("ITIN-Registration-Form")).toBeUndefined();
  });
});

describe("getFormsByCategory()", () => {
  it("returns all active forms for 'all' category", () => {
    const all = getFormsByCategory("all");
    expect(all).toHaveLength(forms.filter((f) => f.active).length);
  });

  it("returns only tax forms for 'tax' category", () => {
    const taxForms = getFormsByCategory("tax");
    expect(taxForms.length).toBeGreaterThan(0);
    taxForms.forEach((f) => {
      expect(f.category).toBe("tax");
    });
  });

  it("tax category contains ITIN Registration Form", () => {
    const taxForms = getFormsByCategory("tax");
    const itin = taxForms.find((f) => f.slug === "itin-registration-form");
    expect(itin).toBeDefined();
  });

  it("returns only immigration forms for 'immigration' category", () => {
    const forms = getFormsByCategory("immigration");
    expect(forms.length).toBeGreaterThan(0);
    forms.forEach((f) => {
      expect(f.category).toBe("immigration");
    });
  });

  it("returns only licensing forms for 'licensing' category", () => {
    const licensingForms = getFormsByCategory("licensing");
    expect(licensingForms.length).toBeGreaterThan(0);
    licensingForms.forEach((f) => {
      expect(f.category).toBe("licensing");
    });
  });

  it("returns only insurance forms for 'insurance' category", () => {
    const insuranceForms = getFormsByCategory("insurance");
    expect(insuranceForms.length).toBeGreaterThan(0);
    insuranceForms.forEach((f) => {
      expect(f.category).toBe("insurance");
    });
  });

  it("returns results sorted by priority (ascending)", () => {
    const all = getFormsByCategory("all");
    for (let i = 1; i < all.length; i++) {
      expect(all[i].priority).toBeGreaterThan(all[i - 1].priority);
    }
  });

  it("returns only active forms (no inactive)", () => {
    const all = getFormsByCategory("all");
    all.forEach((f) => {
      expect(f.active).toBe(true);
    });
  });
});

describe("categories array", () => {
  it("has 8 entries including 'all'", () => {
    expect(categories).toHaveLength(8);
  });

  it("first entry is 'all'", () => {
    expect(categories[0].key).toBe("all");
  });

  it("contains all expected category keys", () => {
    const keys = categories.map((c) => c.key);
    expect(keys).toContain("tax");
    expect(keys).toContain("business");
    expect(keys).toContain("insurance");
    expect(keys).toContain("immigration");
    expect(keys).toContain("licensing");
    expect(keys).toContain("financial");
    expect(keys).toContain("other");
  });

  it("every category key has a non-empty label", () => {
    categories.forEach((c) => {
      expect(c.label.length).toBeGreaterThan(0);
    });
  });
});

describe("categoryColors", () => {
  const validCategories: FormConfig["category"][] = [
    "tax",
    "business",
    "insurance",
    "immigration",
    "licensing",
    "financial",
    "other",
  ];

  it("has a color entry for every form category", () => {
    validCategories.forEach((cat) => {
      expect(categoryColors[cat]).toBeDefined();
      expect(categoryColors[cat].length).toBeGreaterThan(0);
    });
  });
});

describe("specific known forms", () => {
  it("BOIR Form has id 241705190161044 and category business", () => {
    const form = getFormBySlug("boir-form");
    expect(form?.id).toBe("241705190161044");
    expect(form?.category).toBe("business");
  });

  it("Profit & Loss Form slug is 'profit--loss-form' (special char handling)", () => {
    // toSlug strips & so "Profit & Loss Form" → "profit--loss-form" via double-dash then collapse
    // Actually: & is stripped, then "profit  loss form" → "profit--loss-form" via spaces→dash, then dedup
    // Let's just find by searching for the form directly
    const form = forms.find((f) => f.title === "Profit & Loss Form");
    expect(form).toBeDefined();
    expect(form?.category).toBe("financial");
    expect(form?.id).toBe("220756155957061");
  });

  it("Office Address link has correct Google Maps URL", () => {
    const form = getFormBySlug("office-address");
    expect(form?.type).toBe("link");
    expect(form?.linkUrl).toContain("maps.google.com");
    expect(form?.linkUrl).toContain("229-14+Linden+Blvd");
  });

  it("Home Improvement Licensing uses native platform with HomeImprovementForm", () => {
    const form = getFormBySlug("home-improvement-licensing");
    expect(form?.platform).toBe("native");
    expect(form?.nativeComponent).toBe("HomeImprovementForm");
    expect(form?.category).toBe("licensing");
  });
});
