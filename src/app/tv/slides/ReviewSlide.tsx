import { REVIEWS, GOOGLE_RATING } from "@/lib/reviews";

export default function ReviewSlide({ cycleCount }: { cycleCount: number }) {
  const review = REVIEWS[cycleCount % REVIEWS.length];

  return (
    <div className="h-full w-full bg-[#0A0F1A] flex flex-col items-center justify-center px-20">
      <div className="text-[120px] leading-none text-[#F9A825]/30 font-serif mb-[-20px]">&ldquo;</div>
      <blockquote className="text-[32px] text-white text-center leading-relaxed max-w-[1000px] mb-10">
        {review.text}
      </blockquote>
      <div className="flex items-center gap-3 mb-8">
        <p className="text-[24px] font-semibold text-white">{review.name}</p>
        <span className="text-white/30">|</span>
        <p className="text-[20px] text-white/50">{review.date}</p>
      </div>
      <div className="text-[32px] text-[#F9A825] mb-8">{"★".repeat(review.rating)}</div>
      <div className="border border-white/10 rounded-xl px-8 py-3 flex items-center gap-4">
        <span className="text-[20px] font-bold text-white">{GOOGLE_RATING.rating}</span>
        <span className="text-[18px] text-[#F9A825]">★</span>
        <span className="text-[18px] text-white/50">Google Reviews</span>
      </div>
    </div>
  );
}
