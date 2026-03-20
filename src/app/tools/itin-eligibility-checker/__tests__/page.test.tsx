import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ItinEligibilityChecker from "../page";

// ---------- fetch mocks ----------
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

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

// ---------- helpers ----------

function clickYes() {
  fireEvent.click(screen.getByRole("button", { name: /^yes/i }));
}

function clickNo() {
  fireEvent.click(screen.getByRole("button", { name: /^no/i }));
}

/** Path: US citizen (Yes) → not-eligible-citizen */
function pathUsCitizen() {
  clickYes(); // Q1: Are you a US citizen? → yes → not-eligible-citizen
}

/** Path: not citizen, no tax filing need → may-not-need */
function pathNoTaxFiling() {
  clickNo();  // Q1: citizen → no → continue
  clickNo();  // Q2: tax filing need → no → may-not-need
}

/** Path: not citizen, has tax filing, has SSN → not-eligible-ssn */
function pathHasSsn() {
  clickNo();  // Q1: citizen → no
  clickYes(); // Q2: tax filing need → yes → continue
  clickYes(); // Q3: has SSN → yes → not-eligible-ssn
}

/** Path: not citizen, has tax filing, no SSN → eligible */
function pathEligible() {
  clickNo();  // Q1: citizen → no
  clickYes(); // Q2: tax filing need → yes
  clickNo();  // Q3: has SSN → no → eligible
}

async function submitLeadForm(name = "Test User", phone = "9295551234") {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: phone } });
  fireEvent.click(screen.getByRole("button", { name: /get free itin consultation/i }));
}

// ---------- tests ----------

describe("ItinEligibilityChecker – initial render", () => {
  it("renders the page heading", () => {
    render(<ItinEligibilityChecker />);
    expect(screen.getByRole("heading", { name: /itin eligibility checker/i })).toBeInTheDocument();
  });

  it("shows Question 1 of 3 label", () => {
    render(<ItinEligibilityChecker />);
    expect(screen.getByText(/question 1 of 3/i)).toBeInTheDocument();
  });

  it("renders the first question about US citizenship", () => {
    render(<ItinEligibilityChecker />);
    expect(
      screen.getByText(/are you a us citizen or permanent resident/i)
    ).toBeInTheDocument();
  });

  it("renders Yes and No answer buttons", () => {
    render(<ItinEligibilityChecker />);
    expect(screen.getByRole("button", { name: /^yes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^no/i })).toBeInTheDocument();
  });

  it("does not show a gate or result initially", () => {
    render(<ItinEligibilityChecker />);
    expect(screen.queryByText(/you likely qualify/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/you don.*t need an itin/i)).not.toBeInTheDocument();
  });
});

describe("ItinEligibilityChecker – outcome: not-eligible-citizen", () => {
  it("US citizen answer shows 'You Don't Need an ITIN' title", () => {
    render(<ItinEligibilityChecker />);
    pathUsCitizen();
    expect(screen.getByText(/you don.*t need an itin/i)).toBeInTheDocument();
  });

  it("not-eligible-citizen outcome does NOT show lead capture form", () => {
    render(<ItinEligibilityChecker />);
    pathUsCitizen();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get free itin consultation/i })).not.toBeInTheDocument();
  });

  it("not-eligible-citizen outcome shows 'Free Consultation' link", () => {
    render(<ItinEligibilityChecker />);
    pathUsCitizen();
    expect(screen.getByRole("link", { name: /free consultation/i })).toBeInTheDocument();
  });

  it("not-eligible-citizen shows link to tax services page", () => {
    render(<ItinEligibilityChecker />);
    pathUsCitizen();
    const taxLink = screen.getByRole("link", { name: /view our tax services/i });
    expect(taxLink).toBeDefined();
    expect(taxLink.getAttribute("href")).toMatch(/services\/tax-services/);
  });
});

describe("ItinEligibilityChecker – outcome: may-not-need", () => {
  it("no tax filing need shows 'You May Not Need an ITIN' title", () => {
    render(<ItinEligibilityChecker />);
    pathNoTaxFiling();
    expect(screen.getByText(/you may not need an itin right now/i)).toBeInTheDocument();
  });

  it("may-not-need outcome shows lead capture form", () => {
    render(<ItinEligibilityChecker />);
    pathNoTaxFiling();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get free itin consultation/i })
    ).toBeInTheDocument();
  });
});

describe("ItinEligibilityChecker – outcome: not-eligible-ssn", () => {
  it("has SSN answer shows 'Use Your SSN Instead' title", () => {
    render(<ItinEligibilityChecker />);
    pathHasSsn();
    expect(screen.getByText(/use your ssn instead/i)).toBeInTheDocument();
  });

  it("not-eligible-ssn does NOT show lead capture form", () => {
    render(<ItinEligibilityChecker />);
    pathHasSsn();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get free itin consultation/i })).not.toBeInTheDocument();
  });

  it("not-eligible-ssn shows 'Free Consultation' link", () => {
    render(<ItinEligibilityChecker />);
    pathHasSsn();
    expect(screen.getByRole("link", { name: /free consultation/i })).toBeInTheDocument();
  });
});

describe("ItinEligibilityChecker – outcome: eligible", () => {
  it("eligible path shows 'You Likely Qualify for an ITIN!' title", () => {
    render(<ItinEligibilityChecker />);
    pathEligible();
    expect(screen.getByText(/you likely qualify for an itin/i)).toBeInTheDocument();
  });

  it("eligible outcome shows lead capture form", () => {
    render(<ItinEligibilityChecker />);
    pathEligible();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get free itin consultation/i })
    ).toBeInTheDocument();
  });

  it("eligible outcome shows IRS Certified Acceptance Agent copy", () => {
    render(<ItinEligibilityChecker />);
    pathEligible();
    // Multiple elements may contain this text (hero + outcome description)
    const matches = screen.getAllByText(/irs certified acceptance agent/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

describe("ItinEligibilityChecker – lead capture form submission", () => {
  it("calls /api/contact on submission from eligible path", async () => {
    mockFetchSuccess();
    render(<ItinEligibilityChecker />);
    pathEligible();
    await submitLeadForm("Maria Lopez", "9295550001");

    await waitFor(() => expect(global.fetch).toHaveBeenCalledOnce());
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(opts.body)).toMatchObject({
      fullName: "Maria Lopez",
      phone: "9295550001",
      source: "itin-checker",
      serviceType: "itin",
    });
  });

  it("shows 'Sending...' while request is in flight", async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ItinEligibilityChecker />);
    pathEligible();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Maria" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "929" } });
    fireEvent.click(screen.getByRole("button", { name: /get free itin consultation/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /sending/i })).toBeInTheDocument()
    );
  });

  it("shows success state after submission", async () => {
    mockFetchSuccess();
    render(<ItinEligibilityChecker />);
    pathEligible();
    await submitLeadForm("Maria Lopez");

    await waitFor(() =>
      expect(screen.getByText(/thank you, maria lopez/i)).toBeInTheDocument()
    );
  });

  it("shows error message on fetch failure", async () => {
    mockFetchError("Server error");
    render(<ItinEligibilityChecker />);
    pathEligible();
    await submitLeadForm();

    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
    expect(screen.queryByText(/thank you/i)).not.toBeInTheDocument();
  });
});

describe("ItinEligibilityChecker – post-capture state", () => {
  async function getToPostCapture(name = "Maria Lopez") {
    mockFetchSuccess();
    render(<ItinEligibilityChecker />);
    pathEligible();
    await submitLeadForm(name);
    await waitFor(() => screen.getByText(new RegExp(`thank you, ${name}`, "i")));
  }

  it("shows 'Start ITIN Application' link to JotForm page", async () => {
    await getToPostCapture();
    const link = screen.getByRole("link", { name: /start itin application/i });
    expect(link).toHaveAttribute("href", "/resources/forms/itin-registration-form/");
  });

  it("shows 'All Tax Services' link", async () => {
    await getToPostCapture();
    const link = screen.getByRole("link", { name: /all tax services/i });
    expect(link).toHaveAttribute("href", "/services/tax-services/");
  });

  it("shows 'What to Expect' process steps", async () => {
    await getToPostCapture();
    expect(screen.getByText(/what to expect/i)).toBeInTheDocument();
    expect(screen.getByText(/w-7 application/i)).toBeInTheDocument();
  });
});

describe("ItinEligibilityChecker – question 2 flow", () => {
  it("shows question 2 (tax filing) after answering No to citizenship", () => {
    render(<ItinEligibilityChecker />);
    clickNo();
    expect(
      screen.getByText(/do you need to file a us tax return/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/question 2 of 3/i)).toBeInTheDocument();
  });

  it("shows question 3 (SSN) after Yes on tax filing", () => {
    render(<ItinEligibilityChecker />);
    clickNo();  // not citizen
    clickYes(); // needs tax filing
    expect(
      screen.getByText(/do you already have a social security number/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/question 3 of 3/i)).toBeInTheDocument();
  });
});
