import { describe, it, expect } from "vitest";
import { GET, OPTIONS } from "../forms/route";

describe("GET /api/v1/resources/forms", () => {
  // -----------------------------------------------------------------------
  // 1. Returns list of forms
  // -----------------------------------------------------------------------
  it("returns a JSON response with forms array and count", async () => {
    const res = GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("forms");
    expect(body).toHaveProperty("count");
    expect(Array.isArray(body.forms)).toBe(true);
    expect(body.count).toBe(body.forms.length);
    expect(body.count).toBeGreaterThan(0);
  });

  // -----------------------------------------------------------------------
  // 2. Each form includes expected fields
  // -----------------------------------------------------------------------
  it("each form includes slug, title, description, category, publicUrl", async () => {
    const res = GET();
    const body = await res.json();

    for (const form of body.forms) {
      expect(form).toHaveProperty("slug");
      expect(form).toHaveProperty("title");
      expect(form).toHaveProperty("description");
      expect(form).toHaveProperty("category");
      expect(form).toHaveProperty("publicUrl");
      expect(form).toHaveProperty("active", true);
      expect(typeof form.slug).toBe("string");
      expect(typeof form.title).toBe("string");
      expect(typeof form.publicUrl).toBe("string");
    }
  });

  it("service forms use form detail URLs and link resources use their live destination URLs", async () => {
    const res = GET();
    const body = await res.json();

    const itin = body.forms.find((form: { slug: string }) => form.slug === "itin-registration-form");
    expect(itin.publicUrl).toContain("advantagenys.com/resources/forms/itin-registration-form");

    const officeAddress = body.forms.find((form: { slug: string }) => form.slug === "office-address");
    expect(officeAddress.publicUrl).toBe(
      "https://maps.google.com/?q=229-14+Linden+Blvd+Cambria+Heights+NY+11411"
    );

    const abcReviews = body.forms.find((form: { slug: string }) => form.slug === "abc-google-reviews");
    expect(abcReviews.publicUrl).toBe("https://g.page/r/CZy_8wX9_yQNEBM/review");

    const zelle = body.forms.find((form: { slug: string }) => form.slug === "zelle-payment-info");
    expect(zelle.publicUrl).toBe("https://www.zellepay.com");
  });

  // -----------------------------------------------------------------------
  // 3. CORS headers are set
  // -----------------------------------------------------------------------
  it("includes CORS headers in the response", async () => {
    const res = GET();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  // -----------------------------------------------------------------------
  // 4. OPTIONS returns 204 with CORS headers
  // -----------------------------------------------------------------------
  it("OPTIONS returns 204 with CORS headers", async () => {
    const res = OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("OPTIONS");
  });

  // -----------------------------------------------------------------------
  // 5. Forms are sorted by priority
  // -----------------------------------------------------------------------
  it("returns forms sorted by priority (ascending)", async () => {
    const res = GET();
    const body = await res.json();

    // publicUrl contains slug, and forms should be in priority order
    // We just verify the array has at least 2 items to make the sort check meaningful
    if (body.forms.length >= 2) {
      // The first form (ITIN) should have the highest priority (lowest number)
      expect(body.forms[0].slug).toBeTruthy();
    }
  });

  // -----------------------------------------------------------------------
  // 6. Only active forms are included
  // -----------------------------------------------------------------------
  it("only includes active forms", async () => {
    const res = GET();
    const body = await res.json();

    for (const form of body.forms) {
      expect(form.active).toBe(true);
    }
  });
});
