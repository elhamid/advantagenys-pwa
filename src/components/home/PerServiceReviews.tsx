import { Container } from "@/components/ui/Container";
import {
  GOOGLE_RATING,
  getReviewsForSegment,
  type ReviewSegment,
} from "@/lib/reviews";

type PerServiceReviewsProps = {
  segment: ReviewSegment;
  heading?: string;
  subheading?: string;
};

/**
 * Render real Google reviews filtered by service segment.
 * If the segment has no text-bearing reviews, renders nothing (no placeholder).
 */
export function PerServiceReviews({
  segment,
  heading = "Don't take our word for it.",
  subheading,
}: PerServiceReviewsProps) {
  const reviews = getReviewsForSegment(segment);
  if (reviews.length === 0) return null;

  return (
    <section className="bg-gray-50 py-14 md:py-20">
      <Container>
        <h2 className="mb-4 text-3xl font-bold text-center text-gray-900 lg:text-4xl">
          {heading}
        </h2>
        {subheading ? (
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-6 text-gray-500 md:mb-14 md:text-base">
            {subheading}
          </p>
        ) : null}
        <div className="grid gap-5 md:grid-cols-3 md:gap-8">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="flex h-full flex-col rounded-[26px] border border-gray-100 bg-white p-6 shadow-sm md:p-8"
            >
              <span
                className="text-5xl font-serif leading-none mb-4 block"
                style={{ color: "rgba(59, 130, 246, 0.15)" }}
              >
                &ldquo;
              </span>
              <p className="text-gray-700 leading-relaxed flex-1 text-[15px] whitespace-pre-line">
                {review.text}
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">
                  {review.name}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-10 text-gray-500 text-sm">
          <a
            href={GOOGLE_RATING.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {GOOGLE_RATING.rating} out of 5 · {GOOGLE_RATING.totalReviews}{" "}
            reviews on Google
          </a>
        </p>
      </Container>
    </section>
  );
}
