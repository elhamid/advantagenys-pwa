import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "../loading";

describe("ServicesLoading", () => {
  it("renders the services loading skeleton", () => {
    render(<Loading />);

    expect(screen.getByLabelText(/loading services/i)).toBeInTheDocument();
  });
});
