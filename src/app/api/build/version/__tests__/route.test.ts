import { afterEach, describe, expect, it } from "vitest";
import { dynamic, GET } from "../route";

describe("GET /api/build/version", () => {
  const originalEnv = {
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  afterEach(() => {
    process.env.VERCEL_GIT_COMMIT_SHA = originalEnv.VERCEL_GIT_COMMIT_SHA;
    process.env.VERCEL_GIT_COMMIT_REF = originalEnv.VERCEL_GIT_COMMIT_REF;
    process.env.VERCEL_ENV = originalEnv.VERCEL_ENV;
  });

  it("returns public deployment metadata without caching", async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    process.env.VERCEL_GIT_COMMIT_REF = "main";
    process.env.VERCEL_ENV = "production";

    const response = GET();

    expect(dynamic).toBe("force-dynamic");
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      gitCommitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      gitCommitRef: "main",
      vercelEnv: "production",
    });
  });
});
