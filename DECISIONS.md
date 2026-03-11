# Decisions

Simple log of decisions made, outcomes, and learnings.

| Date | Decision | Context | Outcome | Learning |
|------|----------|---------|---------|----------|
| 2026-03-10 | Site title "Advantage Services" not "AdvantageOS" | AdvantageOS is internal agentic OS name, public PWA must be branded differently | Fixed in layout.tsx + manifest.json | Internal product names ≠ public branding |
| 2026-03-10 | Solid white mobile nav, not glassmorphism | Semi-transparent panel let dark hero bleed through, text unreadable | Replaced rgba backgrounds with solid #FFFFFF/#F8FAFC | Glassmorphism fails over dark/busy backgrounds — use solid for reliability |
| 2026-03-10 | ChatWidget overhaul planned — context-aware AI nurture | Static WhatsApp/Call widget provides no intelligence, no lead scoring | Phase 1: fix overflow + animations. Phase 2: page-aware prompts. Phase 3: nurture layer | ChatWidget is the highest-leverage mobile UX improvement |
| 2026-03-10 | Mobile UX audit baseline: 8.2/10 | Comprehensive audit of all 18 homepage components for mobile | Touch targets good (≥44px), animations solid, ChatWidget is weakest link | Systematic audit before redesign prevents wasted effort |
| 2026-03-10 | PWA icons recolored to brand indigo + cyan | Original logo had old blue/cyan colors, needed brand alignment | Generated 6 icon sizes + favicon with Pillow luminosity-preserving recolor | Programmatic recoloring preserves 3D shading better than manual |
| 2026-03-10 | Email: Namecheap Private Email Ultimate | Google Workspace too expensive, Zoho free tier gone, team uses Gmail | 5 mailboxes on advantagenys.com, POP3 pull to Gmail, "Send mail as" configured | POP3 pull + Gmail "Send mail as" = cheapest unified branding path |
| 2026-03-10 | itintaxid.com = lead magnet, PWA = intake | Keep SEO site for traffic, redirect forms to advantagenys.com | Unizon dev instructions prepared: update phones, CTA → PWA forms | Separate traffic generation from intake processing |
