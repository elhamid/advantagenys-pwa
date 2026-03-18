import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn() — className utility", () => {
  // --- Basic merging ---

  it("returns an empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns a single string unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins two strings with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("joins multiple strings with spaces", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  // --- Falsy values are ignored ---

  it("ignores undefined values", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });

  it("ignores null values", () => {
    expect(cn("a", null, "b")).toBe("a b");
  });

  it("ignores false values", () => {
    expect(cn("a", false, "b")).toBe("a b");
  });

  it("ignores empty strings", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  // --- Conditional classes (clsx feature) ---

  it("includes class when condition is true", () => {
    expect(cn("base", true && "active")).toBe("base active");
  });

  it("excludes class when condition is false", () => {
    expect(cn("base", false && "inactive")).toBe("base");
  });

  // --- Object syntax (clsx feature) ---

  it("includes keys with truthy values in object form", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });

  it("includes multiple truthy keys from an object", () => {
    const result = cn({ foo: true, bar: true, baz: false });
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).not.toContain("baz");
  });

  // --- Array syntax (clsx feature) ---

  it("flattens arrays of class names", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("flattens nested arrays", () => {
    expect(cn(["a", ["b", "c"]])).toBe("a b c");
  });

  // --- Mixed inputs ---

  it("handles mixed string and object inputs", () => {
    const result = cn("base", { active: true }, "extra");
    expect(result).toBe("base active extra");
  });

  it("returns correct classes for typical Tailwind usage", () => {
    const variant = "primary";
    const result = cn(
      "inline-flex items-center font-semibold",
      variant === "primary" && "bg-blue-600 text-white",
      variant === "secondary" && "bg-gray-200 text-gray-900"
    );
    expect(result).toBe("inline-flex items-center font-semibold bg-blue-600 text-white");
  });
});
