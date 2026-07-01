import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

function makeRequest(path: string) {
  return new NextRequest(`http://localhost:3000${path}`);
}

describe("/p/border-office-buildings-billboard", () => {
  it("returns 404 without a valid token", async () => {
    const response = await GET(makeRequest("/p/border-office-buildings-billboard"));

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("serves the billboard HTML with a valid token", async () => {
    const response = await GET(
      makeRequest("/p/border-office-buildings-billboard?token=bob-keda-r7n4q2")
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(response.headers.get("Set-Cookie")).toContain(
      "pwa-auth-border-office-buildings-billboard=bob-keda-r7n4q2"
    );
    expect(html).toContain("Border Office Buildings");
    expect(html).toContain("Own-vs-Rent calculator");
  });
});
