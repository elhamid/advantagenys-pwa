import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockClient = { from: vi.fn() };

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockClient),
}));

describe("supabase", () => {
  const originalEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalEnv.SUPABASE_SERVICE_ROLE_KEY;
    vi.resetModules();
  });

  it("throws when the public URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    vi.resetModules();

    await expect(import("../supabase")).rejects.toThrow(
      /missing NEXT_PUBLIC_SUPABASE_URL/i
    );
  });

  it("throws when the service role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.resetModules();

    await expect(import("../supabase")).rejects.toThrow(
      /missing SUPABASE_SERVICE_ROLE_KEY/i
    );
  });

  it("creates the server-side client with auth disabled", async () => {
    const { supabase } = await import("../supabase");
    const { createClient } = await import("@supabase/supabase-js");

    expect(createClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "service-role-key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    expect(supabase).toBe(mockClient);
  });
});
