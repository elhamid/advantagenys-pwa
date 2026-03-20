import { describe, it, expect } from "vitest";
import { GOOGLE_RATING, REVIEWS } from "../reviews";

describe("GOOGLE_RATING", () => {
  it("has a rating of 4.9", () => {
    expect(GOOGLE_RATING.rating).toBe(4.9);
  });

  it("rating is between 1 and 5", () => {
    expect(GOOGLE_RATING.rating).toBeGreaterThanOrEqual(1);
    expect(GOOGLE_RATING.rating).toBeLessThanOrEqual(5);
  });

  it("has totalReviews of 27", () => {
    expect(GOOGLE_RATING.totalReviews).toBe(27);
  });

  it("totalReviews is a positive integer", () => {
    expect(GOOGLE_RATING.totalReviews).toBeGreaterThan(0);
    expect(Number.isInteger(GOOGLE_RATING.totalReviews)).toBe(true);
  });

  it("has a valid placeId", () => {
    expect(GOOGLE_RATING.placeId).toBeTruthy();
    expect(typeof GOOGLE_RATING.placeId).toBe("string");
    expect(GOOGLE_RATING.placeId.length).toBeGreaterThan(0);
  });

  it("placeId matches the expected value", () => {
    expect(GOOGLE_RATING.placeId).toBe("ChIJY46eCLljwokRnL_zBf3_JA0");
  });

  it("mapsUrl is a valid Google Maps URL", () => {
    expect(GOOGLE_RATING.mapsUrl).toMatch(/^https:\/\/www\.google\.com\/maps/);
  });

  it("mapsUrl contains Advantage", () => {
    expect(GOOGLE_RATING.mapsUrl).toContain("Advantage");
  });
});

describe("REVIEWS", () => {
  it("has 5 reviews", () => {
    expect(REVIEWS).toHaveLength(5);
  });

  it("every review has a non-empty name", () => {
    REVIEWS.forEach((review) => {
      expect(review.name).toBeTruthy();
      expect(review.name.length).toBeGreaterThan(0);
    });
  });

  it("every review has a rating of 5", () => {
    REVIEWS.forEach((review) => {
      expect(review.rating).toBe(5);
    });
  });

  it("every review has a non-empty text", () => {
    REVIEWS.forEach((review) => {
      expect(review.text).toBeTruthy();
      expect(review.text.length).toBeGreaterThan(10);
    });
  });

  it("every review has a date string", () => {
    REVIEWS.forEach((review) => {
      expect(review.date).toBeTruthy();
      expect(typeof review.date).toBe("string");
    });
  });

  it("every review has a photoUrl that is a valid Google user content URL", () => {
    REVIEWS.forEach((review) => {
      expect(review.photoUrl).toMatch(/^https:\/\/lh3\.googleusercontent\.com/);
    });
  });

  it("all reviewer names are unique", () => {
    const names = REVIEWS.map((r) => r.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("contains Brandon Diodati as the first review", () => {
    expect(REVIEWS[0].name).toBe("Brandon Diodati");
    expect(REVIEWS[0].rating).toBe(5);
  });

  it("contains a review from SJ Trendz Inc. with 5-star rating", () => {
    const review = REVIEWS.find((r) => r.name === "SJ Trendz Inc.");
    expect(review).toBeDefined();
    expect(review?.rating).toBe(5);
    expect(review?.text).toContain("Advantage Services");
  });

  it("all review texts are at least 50 characters", () => {
    REVIEWS.forEach((review) => {
      expect(review.text.length).toBeGreaterThan(50);
    });
  });
});
