"use client";

import { useEffect, useState } from "react";

// Client-side private access gate — same pattern as the Tropical Stars
// deal-room page (src/app/p/tropical-stars). A one-click signed link uses
// the `?code=` query param (or `#hash`) to auto-unlock. Low-sensitivity
// personal content shared with a named recipient; page is noindexed and
// excluded from nav/sitemap (chromeless via the /p prefix in LayoutShell).
const ACCESS_CODES = new Set([
  "PERGOLA",
  "PERGOLA2026",
  "LOUVERED",
  "ADVANTAGE",
]);

function normalizeAccessCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function accessFromLocation() {
  if (typeof window === "undefined") return false;
  const hash = normalizeAccessCode(window.location.hash.replace("#", ""));
  const query = normalizeAccessCode(
    new URLSearchParams(window.location.search).get("code") ?? ""
  );
  return ACCESS_CODES.has(hash) || ACCESS_CODES.has(query);
}

export function PergolaDossier() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      accessFromLocation() ||
      window.localStorage.getItem("pergola-dossier-access") === "granted"
    ) {
      setUnlocked(true);
    }
  }, []);

  function submitAccess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeAccessCode(code);
    if (ACCESS_CODES.has(normalized)) {
      window.localStorage.setItem("pergola-dossier-access", "granted");
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Access code not recognized.");
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#eef1ee] text-[#1f2420]">
        <section className="relative z-10 flex min-h-screen items-center justify-center px-5">
          <form
            onSubmit={submitAccess}
            className="w-full max-w-[440px] rounded-[18px] border border-[#dde3dd] bg-white p-6 shadow-[0_28px_70px_-36px_rgba(31,36,32,0.45)] sm:p-7"
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#2f7d52]">
              Private Shortlist
            </div>
            <h1 className="text-[1.7rem] font-semibold leading-tight tracking-tight text-[#1f2420]">
              12&prime;&times;16&prime; Louvered Pergola
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6d7670]">
              Private comparison page. Enter the access code to continue.
            </p>
            <label
              htmlFor="access-code"
              className="mt-6 block text-xs font-bold uppercase tracking-[0.18em] text-[#6d7670]"
            >
              Access code
            </label>
            <input
              id="access-code"
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#dde3dd] bg-[#f4f7f4] px-4 py-3 font-mono text-sm tracking-[0.12em] text-[#1f2420] outline-none transition focus:border-[#2f7d52] focus:ring-4 focus:ring-[#d8ece0]"
              placeholder="pergola"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f7d52] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#264f37]">
              View shortlist
            </button>
            <p className="mt-3 min-h-5 text-sm font-semibold text-[#b5483a]">
              {error}
            </p>
            <p className="mt-5 border-t border-[#e3e8e3] pt-4 text-[11px] leading-5 text-[#8a9189]">
              Prepared for a named recipient only. Prices and specs are a
              snapshot and change often.
            </p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="pergola-doc">
      <style>{`
        .pergola-doc{
          --bg:#eef1ee; --ink:#1f2420; --muted:#6d7670; --line:#dde3dd;
          --green:#2f7d52; --greenbg:#e6f2ea; --gold:#b5832f; --red:#b5483a;
          --led:#caa23b; --ledbg:#fbf3dd;
          --card:#fff; --shadow:0 2px 10px rgba(0,0,0,.06);
          --motor:#e9eff3; --motorbar:#3f6175; --man:#f2eee6; --manbar:#7a6a4a;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
          background:var(--bg);color:var(--ink);line-height:1.45;-webkit-font-smoothing:antialiased;
          min-height:100vh;
        }
        .pergola-doc *{box-sizing:border-box}
        .pergola-doc .wrap{max-width:1280px;margin:0 auto;padding:24px 16px 60px}
        .pergola-doc h1{font-size:27px;letter-spacing:-.5px;margin-bottom:3px}
        .pergola-doc .tag{color:var(--muted);font-size:13.5px;margin-bottom:14px}
        .pergola-doc .tag b{color:var(--green)}

        .pergola-doc .rule{display:flex;gap:12px;align-items:flex-start;background:#fffdf6;border:1px solid #ecdcb4;
              border-radius:12px;padding:11px 15px;margin-bottom:20px}
        .pergola-doc .rule .ic{font-size:18px}.pergola-doc .rule p{font-size:13px;color:#5b4d2c}.pergola-doc .rule b{color:#473b1f}

        .pergola-doc .legend{display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--muted);margin-bottom:18px}
        .pergola-doc .legend span{display:inline-flex;align-items:center;gap:6px}
        .pergola-doc .led-chip{background:var(--ledbg);color:var(--led);font-weight:700;border-radius:6px;padding:1px 7px;font-size:11.5px}
        .pergola-doc .hl-chip{background:var(--greenbg);color:var(--green);font-weight:700;border-radius:6px;padding:1px 7px;font-size:11.5px}

        .pergola-doc .halves{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .pergola-doc .half{border-radius:18px;padding:14px 14px 16px}
        .pergola-doc .half.motor{background:var(--motor)}
        .pergola-doc .half.man{background:var(--man)}
        .pergola-doc .halfhead{display:flex;align-items:center;gap:10px;margin:2px 4px 12px}
        .pergola-doc .halfhead .dot{width:11px;height:11px;border-radius:50%}
        .pergola-doc .motor .dot{background:var(--motorbar)}.pergola-doc .man .dot{background:var(--manbar)}
        .pergola-doc .halfhead h2{font-size:17px;text-transform:uppercase;letter-spacing:.5px}
        .pergola-doc .motor .halfhead h2{color:var(--motorbar)}.pergola-doc .man .halfhead h2{color:var(--manbar)}
        .pergola-doc .halfhead .sub{font-size:11.5px;color:var(--muted);margin-left:auto}

        .pergola-doc .stack{display:flex;flex-direction:column;gap:12px}

        .pergola-doc .col{background:var(--card);border:1px solid var(--line);border-radius:15px;box-shadow:var(--shadow);overflow:hidden}
        .pergola-doc .col.win{border:2px solid var(--green)}
        .pergola-doc .ribbon{font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:6px 14px;color:#fff}
        .pergola-doc .r-value{background:#5a7a8c}.pergola-doc .r-best{background:var(--green)}.pergola-doc .r-prem{background:var(--gold)}
        .pergola-doc .crow{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:12px 15px 4px}
        .pergola-doc .crow h3{font-size:17px;line-height:1.15}
        .pergola-doc .crow .brand{font-size:11.5px;color:var(--muted);margin-top:2px}
        .pergola-doc .price{font-size:21px;font-weight:800;text-align:right;letter-spacing:-.5px;white-space:nowrap}
        .pergola-doc .price small{display:block;font-size:10.5px;font-weight:500;color:var(--muted);letter-spacing:0;margin-top:1px}

        .pergola-doc .specs{list-style:none;padding:6px 15px 4px;font-size:12.5px}
        .pergola-doc .specs li{display:flex;gap:7px;padding:5px 0;border-top:1px solid #eef1ee;align-items:flex-start}
        .pergola-doc .specs li:first-child{border-top:none}
        .pergola-doc .k{flex:0 0 62px;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.3px;padding-top:1px}
        .pergola-doc .v{flex:1;font-weight:500}
        .pergola-doc .v .hl{display:inline-block;background:var(--greenbg);color:var(--green);font-weight:700;border-radius:6px;padding:1px 6px;font-size:11.5px}
        .pergola-doc .v .led{display:inline-block;background:var(--ledbg);color:var(--led);font-weight:700;border-radius:6px;padding:1px 6px;font-size:11.5px}
        .pergola-doc .v .warn{color:var(--gold);font-weight:600}
        .pergola-doc .chk{color:var(--green);font-weight:700}.pergola-doc .x{color:var(--red);font-weight:700}

        .pergola-doc .verdict{padding:9px 15px;background:#f7faf8;border-top:1px solid var(--line);font-size:12px}
        .pergola-doc .verdict b{color:var(--ink)}
        .pergola-doc .verdict .rev{display:block;color:var(--gold);font-weight:700;font-size:11.5px;margin-bottom:3px}
        .pergola-doc .verdict .rev .q{color:var(--muted);font-weight:400;font-style:italic}
        .pergola-doc .src{display:block;text-align:center;text-decoration:none;background:var(--green);color:#fff;font-weight:600;font-size:12.5px;padding:10px;transition:.15s}
        .pergola-doc .src:hover{background:#264f37}
        .pergola-doc .col.value .src{background:#5a7a8c}.pergola-doc .col.value .src:hover{background:#456070}
        .pergola-doc .col.prem .src{background:var(--gold)}.pergola-doc .col.prem .src:hover{background:#946a26}

        .pergola-doc .beamsec{margin-top:26px;background:#fbecea;border:1px solid #f0cfca;border-radius:18px;padding:16px 16px 18px}
        .pergola-doc .beamsec .bh{display:flex;align-items:center;gap:9px;margin-bottom:4px}
        .pergola-doc .beamsec .bh h2{font-size:16px;color:#8a3a30;text-transform:uppercase;letter-spacing:.4px}
        .pergola-doc .beamsec .bnote{font-size:12.5px;color:#7a3a31;margin-bottom:13px}
        .pergola-doc .beamsec .bnote b{color:#5e2c25}
        .pergola-doc .bgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
        .pergola-doc .bcard{background:#fff;border:1px solid #ecd2cd;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
        .pergola-doc .bcard .bbeam{background:var(--red);color:#fff;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;text-align:center;padding:4px}
        .pergola-doc .bcard .bbody{padding:9px 11px 6px;flex:1}
        .pergola-doc .bcard h4{font-size:14px;line-height:1.15}
        .pergola-doc .bcard .bret{font-size:10.5px;color:var(--muted);margin:1px 0 6px}
        .pergola-doc .bcard .bprice{font-size:16px;font-weight:800;letter-spacing:-.3px}
        .pergola-doc .bcard .bmeta{font-size:11px;color:#555;margin-top:5px;line-height:1.5}
        .pergola-doc .bcard .bmeta .star{color:var(--gold);font-weight:700}
        .pergola-doc .bcard .bled{font-size:10.5px;margin-top:5px}
        .pergola-doc .bcard a{display:block;text-align:center;text-decoration:none;background:#b5736a;color:#fff;font-size:11.5px;font-weight:600;padding:7px;margin-top:6px}
        .pergola-doc .bcard a:hover{background:#9c5d55}

        .pergola-doc .takeaway{margin-top:16px;background:#eef4f0;border:1px solid #cfe0d6;border-radius:12px;padding:13px 16px;font-size:13px;color:#2f4a3b}
        .pergola-doc .takeaway b{color:#1f3a2b}

        .pergola-doc footer{margin-top:20px;font-size:11px;color:var(--muted);text-align:center;line-height:1.6}
        .pergola-doc footer a{color:var(--green)}

        @media(max-width:980px){.pergola-doc .halves{grid-template-columns:1fr}.pergola-doc .bgrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:520px){.pergola-doc .bgrid{grid-template-columns:1fr}}
      `}</style>

      <div className="wrap">
        <h1>12&prime;&times;16&prime; Louvered Pergola &mdash; Your Shortlist</h1>
        <p className="tag">
          Filtered for your rules: single clear span &middot;{" "}
          <b>no center beam or post</b> &middot; LED available &middot; sealed
          against rain. Motorized on the left, the same builds manual on the
          right, budget center-beam options at the bottom. Snapshot June 22,
          2026.
        </p>

        <div className="rule">
          <span className="ic">&#9888;&#65039;</span>
          <p>
            <b>The deciding factor:</b> at 16 ft wide, cheap pergolas split into
            two roofs with a <b>center beam</b> (a known leak point). The six up
            top span 16 ft as <b>one clear bay</b> &mdash; built with louvers
            running the long way. The cheaper a unit is, the more likely it has
            that mid-beam.
          </p>
        </div>

        <div className="legend">
          <span>
            <span className="hl-chip">No beam</span> single clear 16-ft span
          </span>
          <span>
            <span className="led-chip">LED</span> lighting available / included
          </span>
          <span>
            <span className="chk">&#10004;</span> yes &nbsp;{" "}
            <span className="x">&#10008;</span> no
          </span>
        </div>

        {/* =================== TWO HALVES =================== */}
        <div className="halves">
          {/* ---------- MOTORIZED ---------- */}
          <div className="half motor">
            <div className="halfhead">
              <span className="dot"></span>
              <h2>Motorized</h2>
              <span className="sub">push-button &middot; remote &middot; app</span>
            </div>
            <div className="stack">
              <div className="col value">
                <div className="ribbon r-value">Lowest price &middot; DIY</div>
                <div className="crow">
                  <div>
                    <h3>Pergolux Sundream / Pro</h3>
                    <div className="brand">Pergolux &middot; ships to door</div>
                  </div>
                  <div className="price">
                    from $5,556<small>13&times;16 higher</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">
                      <span className="chk">&#10004;</span> Motor + app/remote
                    </span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> built-in on Pro / add-on
                      kit
                    </span>
                  </li>
                  <li>
                    <span className="k">Center</span>
                    <span className="v">
                      <span className="hl">No beam &mdash; clear 16 ft</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="warn">
                        Water-resistant; no rain sensor
                      </span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Warranty</span>
                    <span className="v">10 yr frame &middot; 2 yr motor</span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">DIY kit ~3&ndash;5 hrs</span>
                  </li>
                </ul>
                <div className="verdict">
                  <span className="rev">
                    4.6&#9733; &middot; 525+ reviews (Trustpilot){" "}
                    <span className="q">
                      &ldquo;excellent quality, 5-star support&rdquo;
                    </span>
                  </span>
                  <b>Cheapest motorized clear-span.</b> Not fully sealed.
                </div>
                <a
                  className="src"
                  href="https://pergoluxshop.com/products/pergola-pro"
                  target="_blank"
                  rel="noopener"
                >
                  View Pergolux &rarr;
                </a>
              </div>

              <div className="col win">
                <div className="ribbon r-best">&#9733; Best all-round</div>
                <div className="crow">
                  <div>
                    <h3>TerraSummer Motorized</h3>
                    <div className="brand">TerraSummer &middot; DIY or pro</div>
                  </div>
                  <div className="price">
                    &asymp; $8,788<small>single 12&times;16 module</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">
                      <span className="chk">&#10004;</span> Somfy motor + remote
                    </span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> optional integrated
                    </span>
                  </li>
                  <li>
                    <span className="k">Center</span>
                    <span className="v">
                      <span className="hl">No beam &mdash; one clear bay</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="chk">100% weatherproof closed</span>{" "}
                      &middot; sensor add-on
                    </span>
                  </li>
                  <li>
                    <span className="k">Warranty</span>
                    <span className="v">10 yr frame + louvers</span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">DIY/pro ~2&ndash;3 days</span>
                  </li>
                </ul>
                <div className="verdict">
                  <span className="rev">
                    5.0&#9733; &middot; 9 reviews (Judge.me &mdash; small
                    sample){" "}
                    <span className="q">
                      &ldquo;amazing, over half the cost&rdquo;
                    </span>
                  </span>
                  <b>Hits all three at mid price.</b> Few independent reviews
                  yet.
                </div>
                <a
                  className="src"
                  href="https://terrasummer.com/products/large-motorized-louvered-pergola"
                  target="_blank"
                  rel="noopener"
                >
                  View TerraSummer &rarr;
                </a>
              </div>

              <div className="col prem">
                <div className="ribbon r-prem">
                  Premium &middot; most waterproof
                </div>
                <div className="crow">
                  <div>
                    <h3>Azenco R-BLADE</h3>
                    <div className="brand">Azenco &middot; dealer install</div>
                  </div>
                  <div className="price">
                    &asymp; $25k&ndash;45k+<small>installed, quote</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">
                      <span className="chk">&#10004;</span> Motor + app + voice
                    </span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> integrated lighting
                    </span>
                  </li>
                  <li>
                    <span className="k">Center</span>
                    <span className="v">
                      <span className="hl">No beam &mdash; 16-ft louver std</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="chk">Watertight seal</span> &middot;
                      auto-close sensor
                    </span>
                  </li>
                  <li>
                    <span className="k">Warranty</span>
                    <span className="v">
                      Up to 15 yr / lifetime structure*
                    </span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">Professional only</span>
                  </li>
                </ul>
                <div className="verdict">
                  <span className="rev">
                    4.6&#9733; Google &middot; 4.4&#9733; Trustindex (~54){" "}
                    <span className="q">
                      &ldquo;highest quality&rdquo; &mdash; landscape pro
                    </span>
                  </span>
                  <b>Most waterproof + best engineered.</b> *Confirm warranty in
                  writing.
                </div>
                <a
                  className="src"
                  href="https://www.azenco-outdoor.com/r-blade"
                  target="_blank"
                  rel="noopener"
                >
                  View Azenco &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* ---------- MANUAL ---------- */}
          <div className="half man">
            <div className="halfhead">
              <span className="dot"></span>
              <h2>Manual</h2>
              <span className="sub">
                hand-crank &middot; same builds, no motor
              </span>
            </div>
            <div className="stack">
              <div className="col value">
                <div className="ribbon r-value">
                  Lowest price overall &middot; DIY
                </div>
                <div className="crow">
                  <div>
                    <h3>Pergolux Series 4 (S3 crank)</h3>
                    <div className="brand">Pergolux &middot; ships to door</div>
                  </div>
                  <div className="price">
                    from $4,732<small>13&times;16 higher</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">Hand crank, louvers to 120&deg;</span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> add-on strip (gutter
                      groove)
                    </span>
                  </li>
                  <li>
                    <span className="k">Center</span>
                    <span className="v">
                      <span className="hl">No beam &mdash; clear 16 ft</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="warn">Water-resistant</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Warranty</span>
                    <span className="v">10 yr frame &middot; 5 yr coating</span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">DIY kit ~3&ndash;5 hrs</span>
                  </li>
                </ul>
                <div className="verdict">
                  <span className="rev">
                    4.6&#9733; &middot; 525+ reviews (Trustpilot){" "}
                    <span className="q">delivery delays a common gripe</span>
                  </span>
                  <b>Cheapest clear 16-ft span, period.</b> Same frame, minus
                  the motor.
                </div>
                <a
                  className="src"
                  href="https://pergoluxshop.com/products/pergola"
                  target="_blank"
                  rel="noopener"
                >
                  View Pergolux &rarr;
                </a>
              </div>

              <div className="col win">
                <div className="ribbon r-best">&#9733; Best manual all-round</div>
                <div className="crow">
                  <div>
                    <h3>TerraSummer Manual</h3>
                    <div className="brand">TerraSummer &middot; DIY or pro</div>
                  </div>
                  <div className="price">
                    from $8,995<small>single 12&times;16 module</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">Hand crank, louvers to 90&deg;</span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> add-on possible (no motor
                      needed)
                    </span>
                  </li>
                  <li>
                    <span className="k">Center</span>
                    <span className="v">
                      <span className="hl">No beam &mdash; one clear bay</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="chk">Weatherproof when closed</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Warranty</span>
                    <span className="v">10 yr frame + louvers</span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">DIY/pro ~2&ndash;3 days</span>
                  </li>
                </ul>
                <div className="verdict">
                  <span className="rev">
                    5.0&#9733; &middot; 9 reviews (Judge.me &mdash; small
                    sample){" "}
                    <span className="q">&ldquo;easiest to assemble&rdquo;</span>
                  </span>
                  <b>Sealed + clear span, no motor cost.</b> Barely cheaper than
                  its motorized twin &mdash; compare both.
                </div>
                <a
                  className="src"
                  href="https://terrasummer.com/products/manual-louvered-pergola"
                  target="_blank"
                  rel="noopener"
                >
                  View TerraSummer &rarr;
                </a>
              </div>

              <div className="col prem">
                <div className="ribbon r-prem">Premium &middot; pro-built</div>
                <div className="crow">
                  <div>
                    <h3>StruXure (manual operator)</h3>
                    <div className="brand">
                      StruXure &middot; needs Pivot-6 MAX louver
                    </div>
                  </div>
                  <div className="price">
                    &asymp; $20k&ndash;35k+<small>installed &middot; est.</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">Manual operator (hand)</span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> integrated lighting
                      available
                    </span>
                  </li>
                  <li>
                    <span className="k">Center</span>
                    <span className="v">
                      <span className="hl">
                        No beam &mdash; 16 ft via Pivot-6 MAX
                      </span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="warn">
                        Rain-shedding; not guaranteed watertight
                      </span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Warranty</span>
                    <span className="v">15 yr structure &middot; 10 yr operator</span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">Professional only</span>
                  </li>
                </ul>
                <div className="verdict">
                  <span className="rev">
                    4.9&#9733; &middot; 141+ (Trustpilot){" "}
                    <span className="q">
                      great product; some install-delay complaints
                    </span>
                  </span>
                  <b>Premium build, manual to save vs motor.</b> Confirm MAX
                  louver in manual; price is an estimate.
                </div>
                <a
                  className="src"
                  href="https://struxure.com/product/pergola-x/pivot-6-max-louvers"
                  target="_blank"
                  rel="noopener"
                >
                  View StruXure &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* /halves */}

        {/* =================== BUDGET / CENTER-BEAM =================== */}
        <div className="beamsec">
          <div className="bh">
            <span style={{ fontSize: "18px" }}>&#9940;</span>
            <h2>The cheaper ones &mdash; but every one has a center beam</h2>
          </div>
          <p className="bnote">
            These were your original/big-box picks ($1,700&ndash;$3,500). All
            split the 16-ft roof into <b>two halves with a mid-beam</b> &mdash;
            the exact thing you want to avoid, and a recurring leak point in
            owner reviews. Shown so you can see the trade-off clearly.
          </p>
          <div className="bgrid">
            <div className="bcard">
              <div className="bbeam">&#9888; Center beam</div>
              <div className="bbody">
                <h4>Domi</h4>
                <div className="bret">Home Depot</div>
                <div className="bprice">$1,699</div>
                <div className="bmeta">
                  <span className="star">4.7&#9733;</span> (~1,105) &middot; best
                  value
                  <br />5-yr frame warranty
                </div>
                <div className="bled">
                  LED: <span className="x">&#10008;</span> none
                </div>
              </div>
              <a
                href="https://www.homedepot.com/p/domi-outdoor-living-16-ft-W-x-12-ft-D-Aluminum-Pergola-with-Two-Adjustable-Roof-LGFA1604B-D/330307312"
                target="_blank"
                rel="noopener"
              >
                View &rarr;
              </a>
            </div>

            <div className="bcard">
              <div className="bbeam">&#9888; Center beam</div>
              <div className="bbody">
                <h4>Aoxun</h4>
                <div className="bret">Amazon / Walmart</div>
                <div className="bprice">~$1,500&ndash;2,500</div>
                <div className="bmeta">
                  price unverified
                  <br />0&ndash;75&deg; manual louvers
                </div>
                <div className="bled">
                  LED: <span className="x">&#10008;</span> none
                </div>
              </div>
              <a
                href="https://www.amazon.com/Aoxun-Independent-Adjustable-Waterproof-Backyards/dp/B0H39MVFCC"
                target="_blank"
                rel="noopener"
              >
                View &rarr;
              </a>
            </div>

            <div className="bcard">
              <div className="bbeam">&#9888; Center beam</div>
              <div className="bbody">
                <h4>Heynemo</h4>
                <div className="bret">Target (your link)</div>
                <div className="bprice">$2,280</div>
                <div className="bmeta">
                  0 reviews yet
                  <br />1-yr warranty &middot; curtains+net
                </div>
                <div className="bled">
                  LED: <span className="x">&#10008;</span> none
                </div>
              </div>
              <a
                href="https://www.target.com/p/heynemo-12-x-16-louvered-pergola-outdoor-metal-canopy-with-2-independently-adjustable-louver-roof-patio-pergola-with-curtains-netting-black/-/A-1004671577"
                target="_blank"
                rel="noopener"
              >
                View &rarr;
              </a>
            </div>

            <div className="bcard">
              <div className="bbeam">&#9888; Center beam</div>
              <div className="bbody">
                <h4>PURPLE LEAF</h4>
                <div className="bret">Home Depot / Wayfair</div>
                <div className="bprice">$3,002&ndash;3,160</div>
                <div className="bmeta">
                  <span className="star">4.4&#9733;</span> (24)
                  <br />&ldquo;not water-tight&rdquo; in rain
                </div>
                <div className="bled">
                  LED: <span className="chk">&#10004;</span> on some SKUs
                </div>
              </div>
              <a
                href="https://www.wayfair.com/outdoor/pdp/purple-leaf-12-ft-w-x-16-ft-d-louvered-pergola-aluminum-pergola-with-adjustable-roof-hardtop-gazebo-pule1942.html"
                target="_blank"
                rel="noopener"
              >
                View &rarr;
              </a>
            </div>

            <div className="bcard">
              <div className="bbeam">&#9888; Center beam</div>
              <div className="bbody">
                <h4>EROMMY</h4>
                <div className="bret">Bed Bath &amp; Beyond (your link)</div>
                <div className="bprice">~$3,499</div>
                <div className="bmeta">
                  <span className="star">4.5&#9733;</span> (~399)
                  <br />pull-down screens; &ldquo;water hits center beam&rdquo;
                </div>
                <div className="bled">
                  LED: <span className="chk">&#10004;</span> on motorized
                  versions
                </div>
              </div>
              <a
                href="https://www.bedbathandbeyond.com/Home-Garden/EROMMY-Outdoor-Louvered-Pergola-with-Adjustable-Aluminum-Rainproof-Roof-and-Pull-Down-Screen/37933435/product.html"
                target="_blank"
                rel="noopener"
              >
                View &rarr;
              </a>
            </div>
          </div>
        </div>

        <div className="takeaway">
          <b>Bottom line:</b> center beam = cheap ($1,700&ndash;$3,500) &middot;
          single clear span = premium ($4,700+). There is{" "}
          <b>no budget unit that gives a clear 16-ft span</b> &mdash; the
          mid-beam is how they hit the low price. Cheapest way to get the clear
          span you want is the <b>Pergolux manual at ~$4,732</b>; the best
          balance of sealed + clear span is <b>TerraSummer</b>. LED can be added
          to any of the six above.
        </div>

        <footer>
          Prices/specs captured June 22, 2026 &mdash; outdoor pricing changes
          often. StruXure manual figure is an estimate (quote-only); Aoxun price
          unverified. Confirm with each maker that the 16-ft run is a single
          uninterrupted louver bank and that LED fits your chosen model.
          <br />
          Sources:{" "}
          <a
            href="https://pergoluxshop.com/products/pergola"
            target="_blank"
            rel="noopener"
          >
            Pergolux
          </a>{" "}
          &middot;{" "}
          <a
            href="https://terrasummer.com/products/manual-louvered-pergola"
            target="_blank"
            rel="noopener"
          >
            TerraSummer
          </a>{" "}
          &middot;{" "}
          <a
            href="https://www.azenco-outdoor.com/r-blade"
            target="_blank"
            rel="noopener"
          >
            Azenco
          </a>{" "}
          &middot;{" "}
          <a
            href="https://struxure.com/product/pergola-x/pivot-6-max-louvers"
            target="_blank"
            rel="noopener"
          >
            StruXure
          </a>{" "}
          &middot;{" "}
          <a
            href="https://www.homedepot.com/p/domi-outdoor-living-16-ft-W-x-12-ft-D-Aluminum-Pergola-with-Two-Adjustable-Roof-LGFA1604B-D/330307312"
            target="_blank"
            rel="noopener"
          >
            Domi
          </a>{" "}
          &middot;{" "}
          <a
            href="https://www.wayfair.com/outdoor/pdp/purple-leaf-12-ft-w-x-16-ft-d-louvered-pergola-aluminum-pergola-with-adjustable-roof-hardtop-gazebo-pule1942.html"
            target="_blank"
            rel="noopener"
          >
            PURPLE LEAF
          </a>
        </footer>
      </div>
    </div>
  );
}
