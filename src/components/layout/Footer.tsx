import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PHONE, ADDRESS, HOURS, SERVICES, SEGMENTS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-white pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="mb-4">
              <span className="text-xl font-bold text-[var(--blue-soft)]">Advantage</span>
              <span className="text-xl font-bold text-white">Services</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              One Stop-Shop For All Business Solutions. 20+ years serving NYC small businesses.
            </p>
            <address className="text-sm text-slate-300 not-italic leading-relaxed">
              <a href={ADDRESS.googleMaps} className="hover:text-white transition-colors">
                {ADDRESS.street}<br />
                {ADDRESS.city}, {ADDRESS.state} {ADDRESS.zip}
              </a>
            </address>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Services</h3>
            <ul className="space-y-2">
              {SERVICES.map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Industries</h3>
            <ul className="space-y-2">
              {SEGMENTS.map((segment) => (
                <li key={segment.name}>
                  <Link href={segment.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                    {segment.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 mt-6">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-slate-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-300 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/resources" className="text-sm text-slate-300 hover:text-white transition-colors">Resources</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${PHONE.mainTel}`} className="text-sm text-slate-300 hover:text-white transition-colors">
                  {PHONE.main}
                </a>
              </li>
              <li>
                <a href={PHONE.whatsappLink} className="text-sm text-slate-300 hover:text-white transition-colors">
                  WhatsApp: {PHONE.whatsapp}
                </a>
              </li>
              <li className="text-sm text-slate-300">
                {HOURS.days}<br />
                {HOURS.time} {HOURS.timezone}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Advantage Business Consulting LLC. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-slate-400 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
