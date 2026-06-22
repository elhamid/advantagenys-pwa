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
        .pergola-doc .wrap{max-width:1240px;margin:0 auto;padding:24px 16px 60px}
        .pergola-doc h1{font-size:27px;letter-spacing:-.5px;margin-bottom:3px}
        .pergola-doc .tag{color:var(--muted);font-size:13.5px;margin-bottom:14px}
        .pergola-doc .tag b{color:var(--green)}

        .pergola-doc .rule{display:flex;gap:12px;align-items:flex-start;background:#eef4f0;border:1px solid #cfe0d6;
              border-radius:12px;padding:11px 15px;margin-bottom:18px}
        .pergola-doc .rule .ic{font-size:18px}
        .pergola-doc .rule p{font-size:13px;color:#2f4a3b}
        .pergola-doc .rule b{color:#1f3a2b}

        .pergola-doc .legend{display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--muted);margin-bottom:18px}
        .pergola-doc .legend span{display:inline-flex;align-items:center;gap:6px}
        .pergola-doc .led-chip{background:var(--ledbg);color:var(--led);font-weight:700;border-radius:6px;padding:1px 7px;font-size:11.5px}
        .pergola-doc .star{color:var(--gold);font-weight:700}

        .pergola-doc .halves{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
        .pergola-doc .half{border-radius:18px;padding:14px 14px 16px}
        .pergola-doc .half.motor{background:var(--motor)}
        .pergola-doc .half.man{background:var(--man)}
        .pergola-doc .halfhead{display:flex;align-items:center;gap:10px;margin:2px 4px 12px}
        .pergola-doc .halfhead .dot{width:11px;height:11px;border-radius:50%}
        .pergola-doc .motor .dot{background:var(--motorbar)}
        .pergola-doc .man .dot{background:var(--manbar)}
        .pergola-doc .halfhead h2{font-size:17px;text-transform:uppercase;letter-spacing:.5px}
        .pergola-doc .motor .halfhead h2{color:var(--motorbar)}
        .pergola-doc .man .halfhead h2{color:var(--manbar)}
        .pergola-doc .halfhead .sub{font-size:11.5px;color:var(--muted);margin-left:auto}

        .pergola-doc .stack{display:flex;flex-direction:column;gap:12px}

        .pergola-doc .col{background:var(--card);border:1px solid var(--line);border-radius:15px;box-shadow:var(--shadow);overflow:hidden}
        .pergola-doc .col.win{border:2px solid var(--green)}
        .pergola-doc .ribbon{font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:6px 14px;color:#fff}
        .pergola-doc .r-pick{background:var(--green)}
        .pergola-doc .r-alt{background:#8a8f88}
        .pergola-doc .crow{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:12px 15px 4px}
        .pergola-doc .crow h3{font-size:17px;line-height:1.15}
        .pergola-doc .crow .brand{font-size:11.5px;color:var(--muted);margin-top:2px}
        .pergola-doc .price{font-size:21px;font-weight:800;text-align:right;letter-spacing:-.5px;white-space:nowrap}
        .pergola-doc .price small{display:block;font-size:10.5px;font-weight:500;color:var(--muted);letter-spacing:0;margin-top:1px}

        .pergola-doc .specs{list-style:none;padding:6px 15px 4px;font-size:12.5px}
        .pergola-doc .specs li{display:flex;gap:7px;padding:5px 0;border-top:1px solid #eef1ee;align-items:flex-start}
        .pergola-doc .specs li:first-child{border-top:none}
        .pergola-doc .k{flex:0 0 64px;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.3px;padding-top:1px}
        .pergola-doc .v{flex:1;font-weight:500}
        .pergola-doc .v .rev{color:var(--gold);font-weight:700}
        .pergola-doc .v .led{display:inline-block;background:var(--ledbg);color:var(--led);font-weight:700;border-radius:6px;padding:1px 6px;font-size:11.5px}
        .pergola-doc .v .open{display:inline-block;background:var(--greenbg);color:var(--green);font-weight:700;border-radius:6px;padding:1px 6px;font-size:11.5px}
        .pergola-doc .v .warn{color:var(--gold);font-weight:600}
        .pergola-doc .chk{color:var(--green);font-weight:700}
        .pergola-doc .x{color:var(--red);font-weight:700}

        .pergola-doc .verdict{padding:9px 15px;background:#f7faf8;border-top:1px solid var(--line);font-size:12px}
        .pergola-doc .verdict b{color:var(--ink)}
        .pergola-doc .src{display:block;text-align:center;text-decoration:none;background:var(--green);color:#fff;font-weight:600;font-size:12.5px;padding:10px;transition:.15s}
        .pergola-doc .src:hover{background:#264f37}
        .pergola-doc .col.alt .src{background:#7c8179}
        .pergola-doc .col.alt .src:hover{background:#646962}

        .pergola-doc .takeaway{margin-top:18px;background:#fffdf6;border:1px solid #ecdcb4;border-radius:12px;padding:13px 16px;font-size:13px;color:#5b4d2c}
        .pergola-doc .takeaway b{color:#473b1f}

        .pergola-doc footer{margin-top:18px;font-size:11px;color:var(--muted);text-align:center;line-height:1.6}
        .pergola-doc footer a{color:var(--green)}

        @media(max-width:980px){.pergola-doc .halves{grid-template-columns:1fr}}
      `}</style>

      <div className="wrap">
        <h1>12&prime;&times;16&prime; Louvered Pergola &mdash; Best Pick Under $6,000</h1>
        <p className="tag">
          One <b>motorized</b> and one <b>manual</b> headline pick, each with
          backups. All &le; $6,000 &middot; open rectangular floor (4 corner
          posts, no center column) &middot; LED option &middot; real reviews.
          Snapshot June 22, 2026.
        </p>

        <div className="rule">
          <span className="ic">&#9989;</span>
          <p>
            <b>Your floor stays a clean open rectangle.</b> Every unit here
            stands on just <b>4 corner posts</b> &mdash; no column in the middle
            or mid-span dividing the space. (The overhead roof &ldquo;beam&rdquo;
            on some models is up in the ceiling only; it never touches the floor,
            and per your note that&apos;s fine.)
          </p>
        </div>

        <div className="legend">
          <span>
            <span className="v open">Open floor</span>{" "}
            4 corner posts, no center column
          </span>
          <span>
            <span className="led-chip">LED</span> lighting available / included
          </span>
          <span>
            <span className="star">&#9733;</span> verified rating &nbsp;{" "}
            <span className="chk">&#10004;</span> yes{" "}
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
              <span className="sub">remote &middot; push-button &middot; LED</span>
            </div>
            <div className="stack">

              <div className="col win">
                <div className="ribbon r-pick">&#9733; Motorized pick</div>
                <div className="crow">
                  <div>
                    <h3>Pergolux Sundream / Pro</h3>
                    <div className="brand">Pergolux &middot; ships to door &middot; DIY</div>
                  </div>
                  <div className="price">
                    from $5,556<small>confirm 12&times;16 &le; $6k</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">
                      <span className="chk">&#10004;</span> Motor + app / remote
                    </span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> built-in on Pro / add-on strip
                    </span>
                  </li>
                  <li>
                    <span className="k">Reviews</span>
                    <span className="v">
                      <span className="rev">4.6&#9733; &middot; 525+</span> (Trustpilot) &mdash; &ldquo;excellent quality&rdquo;
                    </span>
                  </li>
                  <li>
                    <span className="k">Floor</span>
                    <span className="v">
                      <span className="open">Open &mdash; 4 posts</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="warn">Water-resistant; no rain sensor</span>
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
                  <b>Best motorized with a real review record under $6k.</b> Clean
                  unbroken ceiling too. Gripe: delivery can run late.
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

              <div className="col alt">
                <div className="ribbon r-alt">Cheapest motorized &middot; most features</div>
                <div className="crow">
                  <div>
                    <h3>MELLCOM Motorized 12&times;16</h3>
                    <div className="brand">Amazon &middot; solar + plug-in</div>
                  </div>
                  <div className="price">
                    check live<small>budget tier</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">
                      <span className="chk">&#10004;</span> Motor + remote + post control
                    </span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> integrated + 6 pull-down screens
                    </span>
                  </li>
                  <li>
                    <span className="k">Reviews</span>
                    <span className="v">
                      <span className="warn">New listing &mdash; few reviews yet</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Floor</span>
                    <span className="v">
                      <span className="open">Open &mdash; 4 posts</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="chk">&ldquo;100% waterproof closed&rdquo;</span> &middot; 80 mph
                    </span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">2 people, ~4&ndash;8 hrs</span>
                  </li>
                </ul>
                <div className="verdict">
                  <b>Most features for the money</b> &mdash; motor, LED, screens,
                  seals shut. Trade-off: little proven track record yet; verify
                  price + reviews on Amazon.
                </div>
                <a
                  className="src"
                  href="https://www.amazon.com/MELLCOM-Motorized-Louvered-Adjustable-Weatherproof/dp/B0GYWY1JTB"
                  target="_blank"
                  rel="noopener"
                >
                  View MELLCOM &rarr;
                </a>
              </div>

            </div>
          </div>

          {/* ---------- MANUAL ---------- */}
          <div className="half man">
            <div className="halfhead">
              <span className="dot"></span>
              <h2>Manual</h2>
              <span className="sub">hand-crank &middot; lowest cost</span>
            </div>
            <div className="stack">

              <div className="col win">
                <div className="ribbon r-pick">&#9733; Manual pick &middot; best value</div>
                <div className="crow">
                  <div>
                    <h3>Domi 12&times;16</h3>
                    <div className="brand">Home Depot &middot; dark gray / white</div>
                  </div>
                  <div className="price">
                    $1,699<small>was $2,199</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">Hand crank, louvers 0&ndash;90&deg;</span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="warn">Add-on strip only (not built-in)</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Reviews</span>
                    <span className="v">
                      <span className="rev">4.7&#9733; &middot; 1,105</span> (Home Depot) &mdash; best-rated here
                    </span>
                  </li>
                  <li>
                    <span className="k">Floor</span>
                    <span className="v">
                      <span className="open">Open &mdash; 4 posts</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">Gutter drainage; water-resistant</span>
                  </li>
                  <li>
                    <span className="k">Warranty</span>
                    <span className="v">5 yr frame &amp; roof</span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">3&ndash;5 people, ~4&ndash;6 hrs</span>
                  </li>
                </ul>
                <div className="verdict">
                  <b>Unbeatable value + the most reviews of anything here.</b>{" "}
                  Want LED built-in? See the two alternatives below.
                </div>
                <a
                  className="src"
                  href="https://www.homedepot.com/p/domi-outdoor-living-16-ft-W-x-12-ft-D-Aluminum-Pergola-with-Two-Adjustable-Roof-LGFA1604B-D/330307312"
                  target="_blank"
                  rel="noopener"
                >
                  View Domi &rarr;
                </a>
              </div>

              <div className="col alt">
                <div className="ribbon r-alt">Alt &middot; LED on some SKUs</div>
                <div className="crow">
                  <div>
                    <h3>PURPLE LEAF 12&times;16</h3>
                    <div className="brand">Home Depot / Wayfair &middot; 4 colors</div>
                  </div>
                  <div className="price">
                    $3,002<small>by retailer</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">Hand pole, louvers 0&ndash;90&deg;</span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="led">LED</span> available on some SKUs
                    </span>
                  </li>
                  <li>
                    <span className="k">Reviews</span>
                    <span className="v">
                      <span className="rev">4.4&#9733; &middot; 24</span> (Wayfair, 12&times;16)
                    </span>
                  </li>
                  <li>
                    <span className="k">Floor</span>
                    <span className="v">
                      <span className="open">Open &mdash; 4 posts</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="warn">Water-resistant, &ldquo;not water-tight&rdquo;</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">2 people, ~6 hrs (9 boxes)</span>
                  </li>
                </ul>
                <div className="verdict">
                  <b>The manual LED option.</b> Most colors + widest availability;
                  aluminum runs thin, so close it before a storm.
                </div>
                <a
                  className="src"
                  href="https://www.wayfair.com/outdoor/pdp/purple-leaf-12-ft-w-x-16-ft-d-louvered-pergola-aluminum-pergola-with-adjustable-roof-hardtop-gazebo-pule1942.html"
                  target="_blank"
                  rel="noopener"
                >
                  View PURPLE LEAF &rarr;
                </a>
              </div>

              <div className="col alt">
                <div className="ribbon r-alt">Alt &middot; most weatherproof + privacy</div>
                <div className="crow">
                  <div>
                    <h3>EROMMY 12&times;16</h3>
                    <div className="brand">Bed Bath &amp; Beyond (your link)</div>
                  </div>
                  <div className="price">
                    ~$3,499<small>direct</small>
                  </div>
                </div>
                <ul className="specs">
                  <li>
                    <span className="k">Operate</span>
                    <span className="v">Hand crank louvers</span>
                  </li>
                  <li>
                    <span className="k">LED</span>
                    <span className="v">
                      <span className="warn">On motorized versions; add-on here</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Reviews</span>
                    <span className="v">
                      <span className="rev">4.5&#9733; &middot; ~399</span> (Wayfair line)
                    </span>
                  </li>
                  <li>
                    <span className="k">Floor</span>
                    <span className="v">
                      <span className="open">Open &mdash; 4 posts</span>
                    </span>
                  </li>
                  <li>
                    <span className="k">Rain</span>
                    <span className="v">
                      <span className="chk">Near-waterproof</span> + 6 pull-down screens
                    </span>
                  </li>
                  <li>
                    <span className="k">Install</span>
                    <span className="v">Heavy; multi-person</span>
                  </li>
                </ul>
                <div className="verdict">
                  <b>Best privacy + weather sealing of the manual three.</b>{" "}
                  Owners note water can sit on the overhead beam &mdash; fine for
                  your floor, just close it before heavy rain.
                </div>
                <a
                  className="src"
                  href="https://www.bedbathandbeyond.com/Home-Garden/EROMMY-Outdoor-Louvered-Pergola-with-Adjustable-Aluminum-Rainproof-Roof-and-Pull-Down-Screen/37933435/product.html"
                  target="_blank"
                  rel="noopener"
                >
                  View EROMMY &rarr;
                </a>
              </div>

            </div>
          </div>

        </div>
        {/* /halves */}

        <div className="takeaway">
          <b>Quick call:</b> if you want a motor,{" "}
          <b>Pergolux (~$5.6k)</b> is the safe pick with a real review record
          &mdash; or <b>MELLCOM</b> for the cheapest motor + LED + screens if
          you&apos;re OK being an early reviewer. If you&apos;d rather save big
          and crank by hand, <b>Domi at $1,699 (4.7&#9733;, 1,105 reviews)</b>{" "}
          is the best value on the page; step up to <b>PURPLE LEAF</b> if you
          want factory LED. Every one gives you a pure open-floor rectangle.
        </div>

        <footer>
          Prices/specs captured June 22, 2026 &mdash; outdoor pricing changes
          often. MELLCOM live price &amp; review count not verified at capture;
          Pergolux figure is the base size, so confirm the 12&times;16 motorized
          config lands under $6,000. Confirm LED availability on your exact SKU
          before buying.
          <br />
          Sources:{" "}
          <a
            href="https://pergoluxshop.com/products/pergola-pro"
            target="_blank"
            rel="noopener"
          >
            Pergolux
          </a>{" "}
          &middot;{" "}
          <a
            href="https://www.amazon.com/MELLCOM-Motorized-Louvered-Adjustable-Weatherproof/dp/B0GYWY1JTB"
            target="_blank"
            rel="noopener"
          >
            MELLCOM
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
          </a>{" "}
          &middot;{" "}
          <a
            href="https://www.bedbathandbeyond.com/Home-Garden/EROMMY-Outdoor-Louvered-Pergola-with-Adjustable-Aluminum-Rainproof-Roof-and-Pull-Down-Screen/37933435/product.html"
            target="_blank"
            rel="noopener"
          >
            EROMMY
          </a>
        </footer>
      </div>
    </div>
  );
}
