import { getFAQsByService } from "@/lib/chat/knowledge";

export async function getServiceFAQs(serviceSlug: string): Promise<Array<{ question: string; answer: string }>> {
  try {
    const entries = await getFAQsByService(serviceSlug);
    return entries.map(entry => ({
      question: entry.title,
      answer: entry.content,
    }));
  } catch (error) {
    console.error(`[FAQ] Failed to fetch FAQs for ${serviceSlug}:`, error);
    return [];
  }
}
