import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Layout from "../layout";

describe("KioskLayout", () => {
  it("passes children through unchanged", () => {
    render(
      <Layout>
        <span>Layout child</span>
      </Layout>
    );

    expect(screen.getByText("Layout child")).toBeInTheDocument();
  });
});
