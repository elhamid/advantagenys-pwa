import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PHONE } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="py-20">
      <Container>
        <div
          className="rounded-[var(--radius-xl)] py-20 px-8 sm:px-16 text-center text-white"
          style={{ background: "linear-gradient(135deg, #4F56E8 0%, #1E293B 100%)" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-slate-200 max-w-xl mx-auto mb-10">
            Talk to a specialist who understands your business. Free consultation, no obligation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="secondary"
              size="lg"
              href="/contact"
              className="bg-white text-[#4F56E8] hover:bg-slate-100 font-semibold"
            >
              Schedule a Call
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={PHONE.whatsappLink}
              className="border-white text-white hover:bg-white/10"
            >
              WhatsApp Us
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-slate-300">
            <a href={`tel:${PHONE.mainTel}`} className="hover:text-white transition-colors">
              Phone: {PHONE.main}
            </a>
            <a href={PHONE.whatsappLink} className="hover:text-white transition-colors">
              WhatsApp: {PHONE.whatsapp}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
