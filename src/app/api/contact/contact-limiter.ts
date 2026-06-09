import { createRateLimiter } from "@/lib/rate-limit";

export const contactLimiter = createRateLimiter(10, 60_000, { label: "api/contact" });
