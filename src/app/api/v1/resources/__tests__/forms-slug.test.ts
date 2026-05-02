import { describe, it, expect } from "vitest";
import { GET, OPTIONS } from "../forms/[slug]/route";

function makeGetRequest(slug: string): [Request, { params: Promise<{ slug: string }> }] {
  const req = new Request(`http://localhost:3000/api/v1/resources/forms/${slug}`);
  const ctx = { params: Promise.resolve({ slug }) };
  return [req, ctx];
}

describe("GET /api/v1/resources/forms/[slug]", () => {
  // -----------------------------------------------------------------------
  // 1. Valid slug returns form data
  // -----------------------------------------------------------------------
  it("returns form data for a valid slug", async () => {
    const [req, ctx] = makeGetRequest("itin-registration-form");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.slug).toBe("itin-registration-form");
    expect(body.title).toBeTruthy();
    expect(body.category).toBeTruthy();
    expect(body.publicUrl).toContain("advantagenys.com/resources/forms/itin-registration-form");
  });

  // -----------------------------------------------------------------------
  // 2. Invalid slug returns 404
  // -----------------------------------------------------------------------
  it("returns 404 for an invalid slug", async () => {
    const [req, ctx] = makeGetRequest("nonexistent-form-slug-xyz");
    const res = await GET(req, ctx);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
    expect(body.slug).toBe("nonexistent-form-slug-xyz");
  });

  // -----------------------------------------------------------------------
  // 3. CORS headers are set on success
  // -----------------------------------------------------------------------
  it("includes CORS headers on success response", async () => {
    const [req, ctx] = makeGetRequest("itin-registration-form");
    const res = await GET(req, ctx);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  // -----------------------------------------------------------------------
  // 4. CORS headers are set on 404 response
  // -----------------------------------------------------------------------
  it("includes CORS headers on 404 response", async () => {
    const [req, ctx] = makeGetRequest("nonexistent-slug");
    const res = await GET(req, ctx);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });

  // -----------------------------------------------------------------------
  // 5. OPTIONS returns 204 with CORS headers
  // -----------------------------------------------------------------------
  it("OPTIONS returns 204 with CORS headers", async () => {
    const res = OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });

  // -----------------------------------------------------------------------
  // 6. Response includes expected public descriptor fields
  // -----------------------------------------------------------------------
  it("response includes all public descriptor fields", async () => {
    const [req, ctx] = makeGetRequest("itin-registration-form");
    const res = await GET(req, ctx);
    const body = await res.json();

    expect(body).toHaveProperty("slug");
    expect(body).toHaveProperty("title");
    expect(body).toHaveProperty("description");
    expect(body).toHaveProperty("category");
    expect(body).toHaveProperty("publicUrl");
    expect(body).toHaveProperty("active", true);
    // Optional fields should be present (possibly null)
    expect(body).toHaveProperty("shortUrl");
    expect(body).toHaveProperty("whatsappText");
    expect(body).toHaveProperty("emailSubject");
    expect(body).toHaveProperty("emailBody");
    expect(body).toHaveProperty("ogImage");
  });
});
