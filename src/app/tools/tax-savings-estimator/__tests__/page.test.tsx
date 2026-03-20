import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TaxSavingsEstimator from "../page";

// ---------- global fetch mock ----------
function mockFetchSuccess() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  } as Response);
}

function mockFetchError(message = "Server error") {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ success: false, error: message }),
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------- helpers ----------

/** Complete step 1 by clicking a filing status option */
function selectFilingStatus(label = "LLC") {
  fireEvent.click(screen.getByText(label));
}

/** Complete step 2 by clicking a revenue option */
function selectRevenue(label = "Under $50,000") {
  fireEvent.click(screen.getByText(label));
}

/** Complete step 3 by clicking a deduction option */
function selectDeductions(label = "Yes — I track and claim deductions") {
  fireEvent.click(screen.getByText(label));
}

/** Drive through all 3 steps */
function completeAllSteps() {
  selectFilingStatus("LLC");
  selectRevenue("Under $50,000");
  selectDeductions("Yes — I track and claim deductions");
}

// ---------- tests ----------

describe("TaxSavingsEstimator – initial render", () => {
  it("renders the page heading", () => {
    render(<TaxSavingsEstimator />);
    expect(screen.getByRole("heading", { name: /tax savings estimator/i })).toBeInTheDocument();
  });

  it("shows step 1 of 3 label", () => {
    render(<TaxSavingsEstimator />);
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  it("renders the filing status question", () => {
    render(<TaxSavingsEstimator />);
    expect(screen.getByText(/what is your current filing status/i)).toBeInTheDocument();
  });

  it("renders all 5 filing status options", () => {
    render(<TaxSavingsEstimator />);
    expect(screen.getByText("Individual (W-2 / 1099)")).toBeInTheDocument();
    expect(screen.getByText("Sole Proprietor")).toBeInTheDocument();
    expect(screen.getByText("LLC")).toBeInTheDocument();
    expect(screen.getByText("S-Corporation")).toBeInTheDocument();
    expect(screen.getByText("C-Corporation")).toBeInTheDocument();
  });

  it("does not show step 2 question initially", () => {
    render(<TaxSavingsEstimator />);
    expect(screen.queryByText(/approximate annual revenue/i)).not.toBeInTheDocument();
  });
});

describe("TaxSavingsEstimator – step navigation", () => {
  it("selecting a filing status advances to step 2", () => {
    render(<TaxSavingsEstimator />);
    selectFilingStatus("LLC");
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/approximate annual revenue/i)).toBeInTheDocument();
  });

  it("step 2 shows all revenue options", () => {
    render(<TaxSavingsEstimator />);
    selectFilingStatus("LLC");
    expect(screen.getByText("Under $50,000")).toBeInTheDocument();
    expect(screen.getByText(/\$50,000.+\$100,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$100,000.+\$250,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$250,000.+\$500,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$500,000\+/)).toBeInTheDocument();
  });

  it("selecting revenue advances to step 3", () => {
    render(<TaxSavingsEstimator />);
    selectFilingStatus("LLC");
    selectRevenue("Under $50,000");
    expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/do you currently track and claim business deductions/i)).toBeInTheDocument();
  });

  it("step 3 shows all 3 deduction options", () => {
    render(<TaxSavingsEstimator />);
    selectFilingStatus("LLC");
    selectRevenue("Under $50,000");
    expect(screen.getByText(/yes.*track and claim deductions/i)).toBeInTheDocument();
    expect(screen.getByText(/no.*don.*t claim any/i)).toBeInTheDocument();
    expect(screen.getByText(/not sure/i)).toBeInTheDocument();
  });

  it("completing all 3 steps shows the lead capture gate (step 4)", () => {
    render(<TaxSavingsEstimator />);
    completeAllSteps();
    expect(screen.getByText(/your estimated savings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it("shows estimated savings dollar range at the lead gate", () => {
    render(<TaxSavingsEstimator />);
    completeAllSteps();
    // LLC + under-50k + yes-deductions: lowPct=0.03, highPct=0.08, income=30000
    // lowSavings=$900, highSavings=$2,400
    expect(screen.getByText(/\$900/)).toBeInTheDocument();
    expect(screen.getByText(/\$2,400/)).toBeInTheDocument();
  });
});

describe("TaxSavingsEstimator – back navigation", () => {
  it("back button on step 2 returns to step 1", () => {
    render(<TaxSavingsEstimator />);
    selectFilingStatus("LLC");
    expect(screen.getByText(/approximate annual revenue/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/← back/i));
    expect(screen.getByText(/what is your current filing status/i)).toBeInTheDocument();
  });

  it("back button on step 3 returns to step 2", () => {
    render(<TaxSavingsEstimator />);
    selectFilingStatus("LLC");
    selectRevenue("Under $50,000");
    expect(screen.getByText(/do you currently track and claim/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/← back/i));
    expect(screen.getByText(/approximate annual revenue/i)).toBeInTheDocument();
  });

  it("back button on step 4 returns to step 3", () => {
    render(<TaxSavingsEstimator />);
    completeAllSteps();
    expect(screen.getByText(/your estimated savings/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/← back/i));
    expect(screen.getByText(/do you currently track and claim/i)).toBeInTheDocument();
  });
});

describe("TaxSavingsEstimator – lead capture form", () => {
  it("submit button is labelled 'Get My Full Report'", () => {
    render(<TaxSavingsEstimator />);
    completeAllSteps();
    expect(screen.getByRole("button", { name: /get my full report/i })).toBeInTheDocument();
  });

  it("shows 'Sending...' on submit while request is pending", async () => {
    // Delay resolution so we can catch the loading state
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<TaxSavingsEstimator />);
    completeAllSteps();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9295551234" } });
    fireEvent.click(screen.getByRole("button", { name: /get my full report/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /sending/i })).toBeInTheDocument()
    );
  });

  it("calls fetch to /api/contact on submission", async () => {
    mockFetchSuccess();
    render(<TaxSavingsEstimator />);
    completeAllSteps();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9295551234" } });
    fireEvent.click(screen.getByRole("button", { name: /get my full report/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledOnce());
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(opts.body)).toMatchObject({
      fullName: "Jane Doe",
      phone: "9295551234",
      source: "tax-estimator",
      serviceType: "tax",
    });
  });

  it("shows success results after successful submission", async () => {
    mockFetchSuccess();
    render(<TaxSavingsEstimator />);
    completeAllSteps();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9295551234" } });
    fireEvent.click(screen.getByRole("button", { name: /get my full report/i }));

    await waitFor(() =>
      expect(screen.getByText(/your tax savings report/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/thank you, jane doe/i)).toBeInTheDocument();
  });

  it("shows 'Our Recommendation' section in results", async () => {
    mockFetchSuccess();
    render(<TaxSavingsEstimator />);
    completeAllSteps();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9295551234" } });
    fireEvent.click(screen.getByRole("button", { name: /get my full report/i }));

    await waitFor(() => expect(screen.getByText(/our recommendation/i)).toBeInTheDocument());
    expect(screen.getByText(/key opportunities/i)).toBeInTheDocument();
  });

  it("shows error message on fetch failure", async () => {
    mockFetchError("Server error");
    render(<TaxSavingsEstimator />);
    completeAllSteps();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9295551234" } });
    fireEvent.click(screen.getByRole("button", { name: /get my full report/i }));

    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
    // Should NOT show results
    expect(screen.queryByText(/your tax savings report/i)).not.toBeInTheDocument();
  });
});

describe("TaxSavingsEstimator – savings calculator logic", () => {
  it("individual filer under-50k without deductions shows higher savings range", async () => {
    mockFetchSuccess();
    render(<TaxSavingsEstimator />);
    // individual + under-50k → lowPct=0.05, highPct=0.15 + 0.05/0.10 (no deductions)
    // = 0.10/0.25, income=30000 → $3,000 – $7,500
    selectFilingStatus("Individual (W-2 / 1099)");
    selectRevenue("Under $50,000");
    // Use regex to avoid em-dash / curly-apostrophe encoding issues
    fireEvent.click(screen.getByText(/No.*don.*t claim any/i));

    // Lead gate shows the savings preview before submission
    expect(screen.getByText(/\$3,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$7,500/)).toBeInTheDocument();
  });

  it("S-Corp filer with deductions shows smaller baseline savings", () => {
    render(<TaxSavingsEstimator />);
    // s-corp + 50k-100k + yes-deductions: lowPct=0.02, highPct=0.08, income=75000
    // $1,500 – $6,000
    selectFilingStatus("S-Corporation");
    selectRevenue("$50,000 – $100,000");
    selectDeductions("Yes — I track and claim deductions");

    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    expect(screen.getByText(/\$6,000/)).toBeInTheDocument();
  });
});
