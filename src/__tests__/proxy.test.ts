import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

const LEGACY_IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

function makeRequest(path: string) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: {
      "user-agent": LEGACY_IOS_UA,
    },
  });
}

describe("proxy", () => {
  it("does not legacy-redirect private /p project links", () => {
    const response = proxy(
      makeRequest("/p/surgical-component-recovery?token=scr-kedar-9m2v6q")
    );

    expect(response.headers.get("location")).toBeNull();
  });

  it("does not legacy-redirect private billboard partner links", () => {
    const response = proxy(
      makeRequest("/p/border-office-buildings-billboard?token=bob-keda-r7n4q2")
    );

    expect(response.headers.get("location")).toBeNull();
  });

  it("still legacy-redirects ordinary app pages for legacy browsers", () => {
    const response = proxy(makeRequest("/services/licensing"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/legacy");
  });
});
