"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { useCart } from "./_components/store";
import { CATALOG, HERO_IMG, money } from "./_components/catalog";
import { useUI } from "./_components/ui";

/* ----------------------------------------------------------------------------
   Lumière landing page — ported from the bundled design artifact.
   Fonts come from next/font (CSS variables --font-display / --font-body).
---------------------------------------------------------------------------- */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

const MARQUEE_ITEMS = [
  "✦ Free ritual gift on orders over ₹5,000",
  "Flat 20% off your first order",
  "Free shipping above ₹2,499",
  "New Moon drop — now live",
  "Buy 2 get 1 free on incense",
];

/* A stand-in for the design's <image-slot> — a soft gradient placeholder
   with the prompt text, since the bundle shipped no real imagery. */
function ImageSlot({
  placeholder,
  style,
  radius = 0,
}: {
  placeholder: string;
  style?: CSSProperties;
  radius?: number;
}) {
  return (
    <div
      className="cat-img"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        color: "#A2906F",
        fontSize: 13,
        letterSpacing: "0.5px",
        fontWeight: 300,
        background:
          "linear-gradient(135deg, #EDE2CC 0%, #E3D4B4 50%, #E8DAC0 100%)",
        borderRadius: radius,
        ...style,
      }}
    >
      {placeholder}
    </div>
  );
}

export default function Home() {
  const { add } = useCart();
  const { showToast } = useUI();
  const progressRef = useRef<HTMLDivElement>(null);

  // scroll progress bar (rAF-throttled, no re-renders)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
        if (progressRef.current) progressRef.current.style.width = pct + "%";
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll-reveal: fade sections in as they enter the viewport
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const addToCart = (id: string) => {
    const item = CATALOG.find((c) => c.id === id);
    if (!item) return;
    add({ id: item.id, name: item.name, price: item.price, img: item.img });
    showToast("Added " + item.name + " to cart");
  };

  return (
    <div
      style={{
        fontFamily: SANS,
        color: "#3D352A",
        background:
          "radial-gradient(1200px 700px at 78% 8%, #F8F1E2 0%, #F2E9D8 45%, #EDE3CE 100%)",
        minHeight: "100vh",
      }}
    >
      {/* scroll progress bar */}
      <div ref={progressRef} className="scroll-progress" />

      {/* announcement marquee */}
      <div style={{ background: "#3D352A", color: "#EBDFC9", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", animation: "marquee 32s linear infinite", willChange: "transform" }}>
          {[0, 1].map((dup) => (
            <div
              key={dup}
              style={{ display: "inline-flex", alignItems: "center", padding: "9px 0", fontSize: "12.5px", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 300 }}
            >
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                  <span style={{ padding: "0 26px" }}>{item}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* hero */}
      <section className="hero" style={{ maxWidth: 1280, margin: "0 auto", padding: "34px 48px 70px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70, alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 13, letterSpacing: "3.5px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 22 }}>Handcrafted · Ethically sourced</p>
          <h1 className="hero-title" style={{ fontFamily: SERIF, fontSize: 76, lineHeight: 1.0, fontWeight: 500, color: "#2F2820", letterSpacing: "-1px", marginBottom: 26 }}>
            Bring intention<br />into every<br />
            <span style={{ fontStyle: "italic", fontWeight: 600, background: "linear-gradient(100deg, #B5894F 0%, #E4C188 30%, #9C7A4E 55%, #E4C188 80%, #B5894F 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", animation: "shimmer 6s linear infinite" }}>space.</span>
          </h1>
          <p style={{ fontSize: "16.5px", lineHeight: 1.7, color: "#6A5F4F", maxWidth: 420, fontWeight: 300, marginBottom: 38 }}>Crystals, candles, and ritual tools chosen to ground your days and soften your evenings. Slow living, beautifully made.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a className="cta-primary" href="#shop" style={{ background: "#3D352A", color: "#F6EFE2", textDecoration: "none", padding: "17px 38px", fontSize: 14, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 400, borderRadius: 2, boxShadow: "0 10px 28px rgba(61,53,42,0.28)" }}>Shop the collection</a>
            <a href="#ritual" style={{ color: "#3D352A", textDecoration: "none", fontSize: 14, letterSpacing: "0.5px", borderBottom: "1px solid #C8A87C", paddingBottom: 3 }}>Our ritual guide →</a>
          </div>
          <div className="hero-stats" style={{ display: "flex", gap: 34, marginTop: 54 }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: "#2F2820" }}>40k+</div>
              <div style={{ fontSize: "12.5px", letterSpacing: "1px", color: "#8A7E6C", textTransform: "uppercase", marginTop: 2 }}>Happy souls</div>
            </div>
            <div style={{ width: 1, background: "#D8CBB2" }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: "#2F2820" }}>4.9★</div>
              <div style={{ fontSize: "12.5px", letterSpacing: "1px", color: "#8A7E6C", textTransform: "uppercase", marginTop: 2 }}>2,100 reviews</div>
            </div>
            <div style={{ width: 1, background: "#D8CBB2" }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: "#2F2820" }}>100%</div>
              <div style={{ fontSize: "12.5px", letterSpacing: "1px", color: "#8A7E6C", textTransform: "uppercase", marginTop: 2 }}>Cruelty free</div>
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", width: 420, height: 420, top: 40, left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(228,193,136,0.55) 0%, rgba(228,193,136,0) 68%)", borderRadius: "50%", zIndex: 0, animation: "glowPulse 7s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: -18, background: "linear-gradient(160deg, #ECDFC4 0%, #E0CFA9 100%)", borderRadius: "220px 220px 12px 12px", zIndex: 0, boxShadow: "0 30px 70px rgba(120,92,48,0.22)" }} />
          <div style={{ position: "absolute", inset: -10, border: "1px solid rgba(180,138,79,0.45)", borderRadius: "214px 214px 10px 10px", zIndex: 2, pointerEvents: "none" }} />
          <Link href="/product" className="hero-media" style={{ display: "block", position: "relative", zIndex: 1, width: "100%", height: 560, borderRadius: "200px 200px 10px 10px", overflow: "hidden" }}>
            <Image
              src={HERO_IMG}
              alt="Om Pendant Chain"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </Link>
          <Link href="/product" className="hero-label" style={{ textDecoration: "none", position: "absolute", zIndex: 2, bottom: 26, left: -28, background: "#F6EFE2", padding: "16px 22px", borderRadius: 4, boxShadow: "0 12px 40px rgba(61,53,42,0.14)" }}>
            <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#B5894F" }}>Best seller · 3D view ◈</div>
            <div style={{ fontFamily: SERIF, fontSize: 21, color: "#2F2820", marginTop: 3 }}>Om Pendant Chain</div>
          </Link>
        </div>
      </section>

      {/* trust strip */}
      <section className="reveal" style={{ borderTop: "1px solid #E3D6BD", borderBottom: "1px solid #E3D6BD", background: "#F1E7D4" }}>
        <div className="trust-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "26px 48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 30 }}>
          {[
            ["Ethically Sourced", "Traceable to the mine"],
            ["Free Shipping ₹2,499+", "Carbon-neutral delivery"],
            ["Cleansed & Charged", "Under the full moon"],
            ["7-Day Returns", "No questions asked"],
          ].map(([title, sub]) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14.5px", fontWeight: 500, color: "#3D352A", letterSpacing: "0.4px" }}>{title}</div>
              <div style={{ fontSize: "12.5px", color: "#8A7E6C", marginTop: 4, fontWeight: 300 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* products */}
      <section id="shop" className="reveal shop-wrap" style={{ maxWidth: 1280, margin: "0 auto", padding: "90px 48px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 13, letterSpacing: "3.5px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 14 }}>Curated for you</p>
          <h2 className="h-section" style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 500, color: "#2F2820", letterSpacing: "-0.5px" }}>The best sellers</h2>
        </div>
        <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
          {CATALOG.map((p) => {
            const pct = Math.round((1 - p.price / p.mrp) * 100) + "% off";
            const lowStock = p.stock <= 3;
            return (
              <div key={p.id} className="product-card" style={{ background: "#FBF6EC", borderRadius: 4, overflow: "hidden", border: "1px solid #EADFC9", display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(120,92,48,0.04)" }}>
                {(() => {
                  const media = (
                    <div style={{ position: "relative", background: "#EDE2CC", overflow: "hidden" }}>
                      {p.img ? (
                        <Image src={p.img} alt={p.name} width={400} height={280} style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
                      ) : (
                        <ImageSlot placeholder={p.ph} style={{ width: "100%", height: 280 }} />
                      )}
                      <span style={{ position: "absolute", top: 12, left: 12, background: "#F6EFE2", color: "#9C7A4E", fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "5px 10px", borderRadius: 2, fontWeight: 500 }}>{p.tag}</span>
                      <span style={{ position: "absolute", top: 12, right: 12, background: "#9C5A3C", color: "#fff", fontSize: 11, letterSpacing: "0.5px", padding: "5px 9px", borderRadius: 2, fontWeight: 500 }}>{pct}</span>
                    </div>
                  );
                  return p.href ? (
                    <Link href={p.href} style={{ display: "block", textDecoration: "none" }}>{media}</Link>
                  ) : media;
                })()}
                <div style={{ padding: "20px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                  {p.href ? (
                    <Link href={p.href} className="nav-link" style={{ fontFamily: SERIF, fontSize: 22, color: "#2F2820", lineHeight: 1.2, textDecoration: "none" }}>{p.name}</Link>
                  ) : (
                    <div style={{ fontFamily: SERIF, fontSize: 22, color: "#2F2820", lineHeight: 1.2 }}>{p.name}</div>
                  )}
                  <div style={{ fontSize: 13, color: "#8A7E6C", fontWeight: 300, marginTop: 5, lineHeight: 1.5, flex: 1 }}>{p.desc}</div>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                      <span style={{ fontSize: 19, color: "#3D352A", fontWeight: 500 }}>{money(p.price)}</span>
                      <span style={{ fontSize: 14, color: "#A89A82", textDecoration: "line-through" }}>{money(p.mrp)}</span>
                    </div>
                    <div style={{ fontSize: "12.5px", marginTop: 7, color: lowStock ? "#9C5A3C" : "#6F8A6A", letterSpacing: "0.3px", fontWeight: 400 }}>
                      {lowStock ? "Only " + p.stock + " left in stock" : p.stock + " in stock"}
                    </div>
                    <button className="add-btn" onClick={() => addToCart(p.id)} style={{ width: "100%", marginTop: 14, background: "#3D352A", color: "#F6EFE2", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", padding: 13, borderRadius: 2 }}>Add to cart</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <a className="outline-btn" href="#shop" style={{ display: "inline-block", background: "none", color: "#3D352A", textDecoration: "none", border: "1px solid #C8A87C", padding: "15px 42px", fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 400, borderRadius: 2 }}>See all products</a>
        </div>
      </section>

      {/* categories */}
      <section id="crystals" className="reveal cat-wrap" style={{ maxWidth: 1280, margin: "0 auto", padding: "70px 48px 90px" }}>
        <div className="cat-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 22, height: 420 }}>
          <div className="cat-tile" style={{ position: "relative", borderRadius: 4, overflow: "hidden" }}>
            <Image src="/product_image/crystals-stones.jpeg" alt="Crystals & Stones" fill className="cat-img" sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(47,40,32,0.55), transparent 55%)", display: "flex", alignItems: "flex-end", padding: 32 }}>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 34, color: "#fff" }}>Crystals & Stones</div>
                <div style={{ color: "#EBDFC9", fontSize: 13, letterSpacing: "1px", marginTop: 4 }}>Shop 60+ →</div>
              </div>
            </div>
          </div>
          <div className="cat-tile" style={{ position: "relative", borderRadius: 4, overflow: "hidden" }}>
            <Image src="/product_image/candles.jpeg" alt="Candles" fill className="cat-img" sizes="(max-width: 900px) 100vw, 25vw" style={{ objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(47,40,32,0.55), transparent 55%)", display: "flex", alignItems: "flex-end", padding: 26 }}>
              <div style={{ fontFamily: SERIF, fontSize: 26, color: "#fff" }}>Candles</div>
            </div>
          </div>
          <div className="cat-tile" style={{ position: "relative", borderRadius: 4, overflow: "hidden" }}>
            <Image src="/product_image/incense-sage.jpeg" alt="Incense & Sage" fill className="cat-img" sizes="(max-width: 900px) 100vw, 25vw" style={{ objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(47,40,32,0.55), transparent 55%)", display: "flex", alignItems: "flex-end", padding: 26 }}>
              <div style={{ fontFamily: SERIF, fontSize: 26, color: "#fff" }}>Incense & Sage</div>
            </div>
          </div>
        </div>
      </section>

      {/* ritual story */}
      <section id="ritual" className="reveal" style={{ background: "#ECE0C9" }}>
        <div className="ritual-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "90px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70, alignItems: "center" }}>
          <div className="cat-tile ritual-media" style={{ position: "relative", width: "100%", height: 460, borderRadius: 6, overflow: "hidden" }}>
            <Image src="/product_image/hands-ritual.webp" alt="The Lumière ritual" fill className="cat-img" sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, letterSpacing: "3.5px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 20 }}>The Lumière ritual</p>
            <h2 className="h-section" style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 1.1, fontWeight: 500, color: "#2F2820", marginBottom: 24 }}>Small rituals,<br />quietly transformative.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#6A5F4F", fontWeight: 300, marginBottom: 22, maxWidth: 460 }}>Light the candle. Set the stone in your palm. Breathe. Our pieces are made to slow you down — a daily invitation to return to yourself.</p>
            <a href="#shop" style={{ color: "#3D352A", textDecoration: "none", fontSize: 14, letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid #C8A87C", paddingBottom: 4 }}>Read the guide</a>
          </div>
        </div>
      </section>

      {/* testimonial */}
      <section className="reveal" style={{ position: "relative", background: "radial-gradient(900px 500px at 50% 0%, #4A4030 0%, #2F2820 60%)", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 500, top: -180, left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(200,168,124,0.22) 0%, rgba(200,168,124,0) 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div className="tm-wrap" style={{ position: "relative", maxWidth: 860, margin: "0 auto", padding: "110px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 22, letterSpacing: "5px", color: "#E4C188", marginBottom: 30 }}>★★★★★</div>
          <blockquote className="tm-quote" style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 1.42, fontWeight: 400, fontStyle: "italic", color: "#F6EFE2" }}>&ldquo;My evenings feel sacred now. The amethyst sits by my bed and the whole ritual just... grounds me.&rdquo;</blockquote>
          <p style={{ fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", color: "#C7B998", marginTop: 30 }}>— Mara K., verified buyer</p>
        </div>
      </section>

      {/* newsletter CTA */}
      <section className="reveal" style={{ background: "#3D352A" }}>
        <div className="news-wrap" style={{ maxWidth: 760, margin: "0 auto", padding: "80px 48px", textAlign: "center" }}>
          <h2 className="h-section" style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 500, color: "#F6EFE2", marginBottom: 16 }}>Join the inner circle</h2>
          <p style={{ fontSize: "15.5px", color: "#C7B998", fontWeight: 300, marginBottom: 34 }}>15% off your first order, moon-phase ritual notes, and early access to new drops.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              showToast("Welcome to the inner circle ✦");
            }}
            className="news-form"
            style={{ display: "flex", gap: 12, maxWidth: 460, margin: "0 auto" }}
          >
            <input type="email" required placeholder="Your email" style={{ flex: 1, background: "#4A4133", border: "1px solid #5E5341", color: "#F6EFE2", padding: "15px 18px", fontFamily: SANS, fontSize: 14, borderRadius: 2, outline: "none" }} />
            <button type="submit" style={{ background: "#C8A87C", color: "#2F2820", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 13, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500, padding: "0 28px", borderRadius: 2 }}>Subscribe</button>
          </form>
        </div>
      </section>

      {/* footer */}
      <footer style={{ background: "#2F2820", color: "#C7B998" }}>
        <div className="footer-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 48px 40px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 26, letterSpacing: "3px", color: "#F6EFE2", textTransform: "uppercase", marginBottom: 14 }}>Lumière</div>
            <p style={{ fontSize: "13.5px", lineHeight: 1.7, fontWeight: 300, maxWidth: 280, color: "#9C8F76" }}>Ethically sourced crystals, candles & ritual tools for a more intentional everyday.</p>
          </div>
          {[
            ["Shop", ["Crystals", "Candles", "Incense", "Gift sets"]],
            ["About", ["Our story", "Sourcing", "Ritual guide", "Journal"]],
            ["Help", ["Shipping", "Returns", "Contact", "FAQ"]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <div style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: "#F6EFE2", marginBottom: 16 }}>{title as string}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "13.5px", fontWeight: 300 }}>
                {(links as string[]).map((l) => (
                  <span key={l} style={{ cursor: "pointer" }}>{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #4A4133", padding: "22px 48px", textAlign: "center", fontSize: 12, letterSpacing: "1px", color: "#8A7E6C" }}>© 2026 Lumière · Made with intention</div>
      </footer>
    </div>
  );
}
