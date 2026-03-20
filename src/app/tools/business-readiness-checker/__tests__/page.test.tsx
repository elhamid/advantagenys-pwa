import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BusinessReadinessChecker from "../page";

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

/** The 5 question texts (in order) used by the checker */
const QUESTIONS = [
  /do you have a registered business entity/i,
  /do you have an ein/i,
  /do you have business insurance/i,
  /are you registered for sales tax/i,
  /do you have a separate business bank account/i,
];

/**
 * Answer questions with an array of booleans (true = Yes, false = No).
 * Must be called after render(). Answers are applied in order.
 */
function answerQuestions(answers: boolean[]) {
  answers.forEach((ans) => {
    const btn = screen.getByRole("button", { name: ans ? /yes/i : /no/i });
    fireEvent.click(btn);
  });
}

/** Answer all 5 questions and reach the lead gate */
function completeChecker(answers: boolean[] = [true, true, true, true, true]) {
  answerQuestions(answers);
}

/** Fill lead form and submit */
async function submitLeadForm(name = "Test User", phone = "9295551234") {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: phone } });
  fireEvent.click(screen.getByRole("button", { name: /see my checklist/i }));
}

// ---------- tests ----------

describe("BusinessReadinessChecker – initial render", () => {
  it("renders the page heading", () => {
    render(<BusinessReadinessChecker />);
    expect(screen.getByRole("heading", { name: /business readiness checker/i })).toBeInTheDocument();
  });

  it("shows Question 1 of 5 label", () => {
    render(<BusinessReadinessChecker />);
    expect(screen.getByText(/question 1 of 5/i)).toBeInTheDocument();
  });

  it("renders the first question about a registered business entity", () => {
    render(<BusinessReadinessChecker />);
    expect(screen.getByText(QUESTIONS[0])).toBeInTheDocument();
  });

  it("renders Yes and No buttons", () => {
    render(<BusinessReadinessChecker />);
    expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();
  });

  it("does not show lead gate initially", () => {
    render(<BusinessReadinessChecker />);
    expect(screen.queryByText(/see my checklist/i)).not.toBeInTheDocument();
  });
});

describe("BusinessReadinessChecker – question progression", () => {
  it("answering Yes advances to question 2", () => {
    render(<BusinessReadinessChecker />);
    fireEvent.click(screen.getByRole("button", { name: /yes/i }));
    expect(screen.getByText(/question 2 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(QUESTIONS[1])).toBeInTheDocument();
  });

  it("answering No also advances to question 2", () => {
    render(<BusinessReadinessChecker />);
    fireEvent.click(screen.getByRole("button", { name: /no/i }));
    expect(screen.getByText(/question 2 of 5/i)).toBeInTheDocument();
  });

  it("advances through all 5 questions sequentially", () => {
    render(<BusinessReadinessChecker />);
    QUESTIONS.forEach((_, i) => {
      expect(screen.getByText(new RegExp(`question ${i + 1} of 5`, "i"))).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /yes/i }));
    });
    // After answering all 5, the gate should appear
    expect(screen.getByText(/see my checklist/i)).toBeInTheDocument();
  });

  it("shows lead gate after all 5 answers", () => {
    render(<BusinessReadinessChecker />);
    completeChecker([true, false, true, false, true]);
    expect(screen.getByText(/see my checklist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });
});

describe("BusinessReadinessChecker – scoring", () => {
  it("score 0 of 5 shows 'Getting Started' label at gate", () => {
    render(<BusinessReadinessChecker />);
    completeChecker([false, false, false, false, false]);
    expect(screen.getByText(/score: 0 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
  });

  it("score 1 of 5 also shows 'Getting Started'", () => {
    render(<BusinessReadinessChecker />);
    completeChecker([true, false, false, false, false]);
    expect(screen.getByText(/score: 1 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
  });

  it("score 2 of 5 shows 'Almost There'", () => {
    render(<BusinessReadinessChecker />);
    completeChecker([true, true, false, false, false]);
    expect(screen.getByText(/score: 2 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText("Almost There")).toBeInTheDocument();
  });

  it("score 3 of 5 shows 'Almost There'", () => {
    render(<BusinessReadinessChecker />);
    completeChecker([true, true, true, false, false]);
    expect(screen.getByText(/score: 3 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText("Almost There")).toBeInTheDocument();
  });

  it("score 4 of 5 shows 'Well Prepared'", () => {
    render(<BusinessReadinessChecker />);
    completeChecker([true, true, true, true, false]);
    expect(screen.getByText(/score: 4 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText("Well Prepared")).toBeInTheDocument();
  });

  it("score 5 of 5 shows 'Well Prepared'", () => {
    render(<BusinessReadinessChecker />);
    completeChecker([true, true, true, true, true]);
    expect(screen.getByText(/score: 5 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText("Well Prepared")).toBeInTheDocument();
  });
});

describe("BusinessReadinessChecker – lead gate submission", () => {
  it("calls /api/contact on form submit", async () => {
    mockFetchSuccess();
    render(<BusinessReadinessChecker />);
    completeChecker([true, false, true, false, true]);
    await submitLeadForm("Test User", "9295551234");

    await waitFor(() => expect(global.fetch).toHaveBeenCalledOnce());
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(opts.body)).toMatchObject({
      fullName: "Test User",
      phone: "9295551234",
      source: "business-readiness",
      serviceType: "formation",
    });
  });

  it("shows 'Sending...' while request is in flight", async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<BusinessReadinessChecker />);
    completeChecker([true, true, true, true, true]);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "929" } });
    fireEvent.click(screen.getByRole("button", { name: /see my checklist/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /sending/i })).toBeInTheDocument()
    );
  });

  it("shows full results after successful submission", async () => {
    mockFetchSuccess();
    render(<BusinessReadinessChecker />);
    completeChecker([true, true, true, true, true]);
    await submitLeadForm("Jane Smith");

    await waitFor(() =>
      expect(screen.getByText(/your business readiness report/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/thank you, jane smith/i)).toBeInTheDocument();
  });

  it("shows error message on fetch failure", async () => {
    mockFetchError("Network error");
    render(<BusinessReadinessChecker />);
    completeChecker([true, true, true, true, true]);
    await submitLeadForm();

    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());
    expect(screen.queryByText(/your business readiness report/i)).not.toBeInTheDocument();
  });
});

describe("BusinessReadinessChecker – results checklist", () => {
  async function getToResults(answers: boolean[]) {
    mockFetchSuccess();
    render(<BusinessReadinessChecker />);
    completeChecker(answers);
    await submitLeadForm("Test User");
    await waitFor(() => screen.getByText(/your business readiness report/i));
  }

  it("renders checklist with all 5 questions", async () => {
    await getToResults([true, true, true, true, true]);
    QUESTIONS.forEach((q) => {
      expect(screen.getByText(q)).toBeInTheDocument();
    });
  });

  it("shows service page links for items answered No", async () => {
    // Answer No to question 1 (entity) and question 3 (insurance), Yes to others
    await getToResults([false, true, false, true, true]);
    // Business formation link for entity gap
    const links = screen.getAllByRole("link");
    const bfLinks = links.filter((l) =>
      l.getAttribute("href")?.includes("/services/business-formation")
    );
    expect(bfLinks.length).toBeGreaterThanOrEqual(1);
    // Insurance link
    const insuranceLinks = links.filter((l) =>
      l.getAttribute("href")?.includes("/services/insurance")
    );
    expect(insuranceLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'We Can Fix This' CTA when there are gaps", async () => {
    await getToResults([false, true, true, true, true]);
    expect(screen.getByText(/we can fix this for you/i)).toBeInTheDocument();
  });

  it("shows 'We Can Fix All of These' when multiple gaps", async () => {
    await getToResults([false, false, true, true, true]);
    expect(screen.getByText(/we can fix all of these for you/i)).toBeInTheDocument();
  });

  it("shows 'You are All Set!' when no gaps", async () => {
    await getToResults([true, true, true, true, true]);
    expect(screen.getByText(/you are all set/i)).toBeInTheDocument();
  });

  it("'You are All Set' card links to Tax Savings Estimator", async () => {
    await getToResults([true, true, true, true, true]);
    const taxLink = screen.getByRole("link", { name: /tax savings estimator/i });
    expect(taxLink).toHaveAttribute("href", "/tools/tax-savings-estimator");
  });
});
