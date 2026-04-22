// Real Google Reviews — pulled from Google Places API on 2026-04-22
// Place ID: ChIJY46eCLljwokRnL_zBf3_JA0
// Business: Advantage Business Consulting LLC
// Aggregate: 4.9 avg across 27 reviews (user_ratings_total)
//
// API LIMITATION: Google Places Details endpoints (legacy v2 and v1)
// return at most 5 reviews per call and expose NO pagination. The remaining
// 22 reviews on the public profile cannot be pulled via Places API.
// To surface all 27, use Google Business Profile API (OAuth as the business
// owner) or export via the GBP dashboard. See REVIEW_SOURCING_NOTES below.
//
// Both endpoints were queried on 2026-04-22:
//   - Legacy: /maps/api/place/details/json?...&reviews_sort=newest
//   - v1:     /v1/places/{id} with FieldMask reviews,rating,userRatingCount
// Legacy surfaced 2 additional rating-only reviews (no text) from newer
// authors — preserved in ADDITIONAL_RATING_ONLY below for the total count.
//
// Segmentation: each review is tagged with one or more service segments
// so landing pages can filter ("give me green-card reviews on the
// immigration landing page"). Tags are derived from text content keywords.

export type ReviewSegment =
  | "tax"
  | "itin"
  | "immigration"
  | "licensing"
  | "insurance"
  | "audit_defense"
  | "business_formation"
  | "general";

export type Review = {
  name: string;
  rating: number;
  text: string;
  date: string;
  photoUrl: string;
  authorUrl?: string;
  time?: number; // unix seconds
  segments: ReviewSegment[];
};

export const GOOGLE_RATING = {
  rating: 4.9,
  totalReviews: 27,
  placeId: "ChIJY46eCLljwokRnL_zBf3_JA0",
  mapsUrl:
    "https://www.google.com/maps/place/Advantage+Business+Consulting+LLC/@40.692388,-73.7344482,1117m",
  lastFetched: "2026-04-22",
} as const;

export const REVIEWS: readonly Review[] = [
  {
    name: "Brandon Diodati",
    rating: 5,
    text: "Fantastic company to work with. The team is made up of great people who communicate clearly and consistently throughout the entire process. They get the job done quickly without sacrificing quality and are extremely flexible and accommodating to changing needs. Highly recommend working with them.",
    date: "3 months ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjWR22uVKo4cjayE14wedQFKwhBGPljFS7WtJGlTD4eoDpqudkYC=s128-c0x00000000-cc-rp-mo-ba2",
    authorUrl:
      "https://www.google.com/maps/contrib/100887467316135906620/reviews",
    time: 1766522865,
    segments: ["general"],
  },
  {
    name: "Delacia P.",
    rating: 5,
    text: "Advantage Business Consulting LLC is truly top-notch! Their team is professional, knowledgeable, and incredibly efficient. They made the entire tax filing process smooth and stress-free, handling everything with precision and care. I was impressed with how quickly they worked while ensuring every detail was accurate.\n\nTheir expertise and customer service are unmatched—I felt confident and well-informed throughout the entire process. If you're looking for a reliable and trustworthy tax service, I highly recommend Advantage Business Consulting LLC. I’ll definitely be returning!",
    date: "a year ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjUyrMXJM5FWLcCLr4CcEpjSiQc-6DCuu63HmtehtHfLkG5wdqPi=s128-c0x00000000-cc-rp-mo",
    authorUrl:
      "https://www.google.com/maps/contrib/102495533485391797267/reviews",
    time: 1741964535,
    segments: ["tax"],
  },
  {
    name: "Oshane Hinds",
    rating: 5,
    text: "With the help of Jay and his team my wife and I are celebrating being granted 10 years on my green card. From day one, they have been very professional and supportive. His extensive wisdom is second to none. He provided questions for us to use in order to prepare for the interview. The guidance was second to none. I’d recommend this Agency to everyone.",
    date: "a year ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjVfsoRER_rGjHB9yHmW7A_PKoYprGxD6alYi97NES53tdd4rbS8=s128-c0x00000000-cc-rp-mo",
    authorUrl:
      "https://www.google.com/maps/contrib/114924661007326044403/reviews",
    time: 1730308906,
    segments: ["immigration"],
  },
  {
    name: "SJ Trendz Inc.",
    rating: 5,
    text: "I have been working with Advantage Business Consulting for several years now and I cannot express enough how impressed I am with their knowledge, quick response time, and professionalism. Every time I have a question or concern, they are always there to provide me with a clear and concise answer. Their team is amazing and I feel like they truly care about my financial well-being. I highly recommend Advantage Business Consulting to anyone who is looking for a reliable and trustworthy accountant. They are truly the best!",
    date: "2 years ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjV_z5YDhOEZogp49FYq32uD6yVI3oOp5tj6RVJ3S7zDlGhjtPkb=s128-c0x00000000-cc-rp-mo",
    authorUrl:
      "https://www.google.com/maps/contrib/114017111282956302321/reviews",
    time: 1706719799,
    segments: ["tax", "general"],
  },
  {
    name: "Palmyre Seraphin",
    rating: 5,
    text: "Advantage Services is truly the best when you need business consultation, licensing and permits, legal services and business insurance. I felt really informed and ready to open my business after I spoke to Jay. The staff is friendly and knowledgeable. I walked out feeling like I was in safe in hands. I look forward to see my business grow.",
    date: "3 years ago",
    photoUrl:
      "https://lh3.googleusercontent.com/a-/ALV-UjUf1EnFBhhcw6-kM3flyoisP6dfNdwFx6g1psKylNN5czeSaIAa=s128-c0x00000000-cc-rp-mo-ba2",
    authorUrl:
      "https://www.google.com/maps/contrib/113475792824995742364/reviews",
    time: 1661807142,
    segments: ["business_formation", "licensing", "insurance"],
  },
] as const;

// Rating-only reviews (no text body) — not displayable but real, pulled
// from legacy endpoint with reviews_sort=newest on 2026-04-22.
// Keep here so future per-service counts line up with Google's public profile.
export const ADDITIONAL_RATING_ONLY = [
  {
    name: "NADEEM BASHIR",
    rating: 5,
    date: "8 months ago",
    time: 1755811852,
    photoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocIaGaab3RP3h7Wq78O3H0mDSC3VXFPkHjA0q0dltVCxJ9ed7g=s128-c0x00000000-cc-rp-mo",
  },
  {
    name: "Preya D D",
    rating: 5,
    date: "a year ago",
    time: 1742068525,
    photoUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocLTpJOrfVXhK1sYTK9ofPLIA4STkM-0S2LecQSMqNMg0asMXvQ=s128-c0x00000000-cc-rp-mo",
  },
] as const;

// Convenience helper: pull reviews for a given service segment.
export function getReviewsForSegment(segment: ReviewSegment): readonly Review[] {
  return REVIEWS.filter((r) => r.segments.includes(segment));
}

// Notes for future sourcing of the other 22 reviews:
// - Google Business Profile API (accounts.locations.reviews.list):
//     requires OAuth consent from the verified owner of the Place.
//     Returns ALL reviews, with pagination. Proper path for parity.
// - Manual: GBP web dashboard exports reviews to CSV.
// - SerpApi (google_maps_reviews engine): paid third-party scraper that
//     bypasses the 5-review cap. Reliable but $$ per run.
// Do NOT rely on Places Details/v1 for full parity — it is capped at 5.
export const REVIEW_SOURCING_NOTES = {
  placesApiLimit: 5,
  knownGapVsProfile: 22,
  ownerOauthPathAvailable: true,
  lastAttempt: "2026-04-22",
} as const;
