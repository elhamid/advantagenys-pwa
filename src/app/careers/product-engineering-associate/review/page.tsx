import type { Metadata } from "next";
import { RecruitingReviewClient } from "./RecruitingReviewClient";

export const metadata: Metadata = {
  title: "Recruiting Review",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RecruitingReviewPage() {
  return <RecruitingReviewClient />;
}
