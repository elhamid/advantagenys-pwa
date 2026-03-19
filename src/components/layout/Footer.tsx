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
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.478 2 2 6.478 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.01.79.81-2.95-.19-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/></svg>
                <a href={`tel:${PHONE.mainTel}`} className="hover:text-white transition-colors">{PHONE.main}</a>
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
