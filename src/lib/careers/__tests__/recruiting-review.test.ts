import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveRecruitingAccess } from "../recruiting-review";

describe("recruiting review access", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects missing or unknown review tokens", () => {
    expect(resolveRecruitingAccess(undefined).allowed).toBe(false);
    expect(resolveRecruitingAccess("wrong").allowed).toBe(false);
  });

  it("allows configured superadmin and JKH review scopes", () => {
    vi.stubEnv("RECRUITING_SUPERADMIN_TOKEN", "superadmin-test-token");
    vi.stubEnv("RECRUITING_JKH_TOKEN", "jkh-test-token");

    expect(resolveRecruitingAccess("superadmin-test-token")).toEqual({
      allowed: true,
      scope: "superadmin",
    });
    expect(resolveRecruitingAccess("jkh-test-token")).toEqual({
      allowed: true,
      scope: "jkh",
    });
  });
});
