"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const PHOTO = "/product_image/necklace.jpeg";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useCart } from "../_components/store";

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

// The 3D canvas is browser-only — load it client-side with a graceful fallback.
const Viewer = dynamic(() => import("./Viewer"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#A2906F", fontSize: 13, letterSpacing: "1px" }}>
      Preparing 3D view…
    </div>
  ),
});

const PRODUCT = {
  name: "Om Pendant Chain",
  tagline: "Oxidised silver · Sacred ॐ",
  price: 2999,
  mrp: 3999,
  rating: 4.9,
  reviews: 412,
  desc: "An oxidised, hand-finished Om (ॐ) pendant on a box chain — the sound of the universe, worn close. A grounding talisman for meditation and everyday intention.",
  details: [
    "Oxidised 925 sterling silver · box chain, 50cm",
    "Hand-detailed Om (ॐ) pendant with antique finish",
    "Cleansed & charged under the full moon",
    "Tarnish-resistant · hypoallergenic",
  ],
};

const money = (n: number) => "₹" + n.toLocaleString("en-IN");

const VIEWS = [
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
  { key: "3d", label: "3D view" },
];

const PRODUCT_ID = "om";

export default function ProductPage() {
  const { add, count } = useCart();
  const [view, setView] = useState("3d"); // the requested "3rd view" is active by default
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const pct = Math.round((1 - PRODUCT.price / PRODUCT.mrp) * 100);

  return (
    <div
      style={{
        fontFamily: SANS,
        color: "#3D352A",
        background: "radial-gradient(1200px 700px at 78% 8%, #F8F1E2 0%, #F2E9D8 45%, #EDE3CE 100%)",
        minHeight: "100vh",
      }}
    >
      {/* nav */}
      <nav className="pdp-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 48px", maxWidth: 1280, margin: "0 auto" }}>
        <Link href="/" style={{ fontSize: 14, color: "#5A4F40", textDecoration: "none", letterSpacing: "0.6px" }}>← Back to shop</Link>
        <Link href="/" className="lp-logo" style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, letterSpacing: "3px", color: "#3D352A", textDecoration: "none", textTransform: "uppercase" }}>Lumière</Link>
        <Link href="/checkout" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#3D352A", textDecoration: "none", minWidth: 110, justifyContent: "flex-end" }}>
          Cart
          <span style={{ background: "#B5894F", color: "#fff", borderRadius: 999, minWidth: 21, height: 21, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, padding: "0 6px" }}>{count}</span>
        </Link>
      </nav>

      <div className="pdp-wrap" style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 48px 90px" }}>
        {/* breadcrumb */}
        <p style={{ fontSize: 12.5, letterSpacing: "1px", color: "#8A7E6C", marginBottom: 28, fontWeight: 300 }}>
          Shop · Crystals · <span style={{ color: "#3D352A" }}>{PRODUCT.name}</span>
        </p>

        <div className="pdp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          {/* ---- gallery / 3D stage ---- */}
          <div>
            <div
              className="pdp-stage"
              style={{
                position: "relative",
                height: 540,
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid #E3D6BD",
                background: "radial-gradient(circle at 50% 35%, #F8F1E2 0%, #ECDFC4 55%, #E0CFA9 100%)",
                boxShadow: "0 30px 70px rgba(120,92,48,0.16)",
              }}
            >
              {/* soft halo behind the product */}
              <div style={{ position: "absolute", width: 420, height: 420, top: 60, left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(228,193,136,0.5) 0%, rgba(228,193,136,0) 68%)", borderRadius: "50%", pointerEvents: "none" }} />

              {view === "3d" ? (
                <>
                  <Viewer />
                  <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(47,40,32,0.78)", color: "#F6EFE2", fontSize: 11.5, letterSpacing: "1.5px", textTransform: "uppercase", padding: "8px 16px", borderRadius: 999, pointerEvents: "none" }}>
                    ✦ Drag to rotate · scroll to zoom
                  </div>
                </>
              ) : (
                <Image
                  src={PHOTO}
                  alt={`${PRODUCT.name} — ${view} view`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{
                    objectFit: "contain",
                    padding: 40,
                    // flip the "side" view so the two flat shots read differently
                    transform: view === "side" ? "scaleX(-1)" : "none",
                  }}
                />
              )}

              <span style={{ position: "absolute", top: 16, left: 16, background: "#9C5A3C", color: "#fff", fontSize: 11, letterSpacing: "0.5px", padding: "5px 10px", borderRadius: 2, fontWeight: 500 }}>{pct}% off</span>
            </div>

            {/* view thumbnails */}
            <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
              {VIEWS.map((v) => {
                const active = v.key === view;
                return (
                  <button
                    key={v.key}
                    onClick={() => setView(v.key)}
                    style={{
                      flex: 1,
                      height: 86,
                      cursor: "pointer",
                      borderRadius: 4,
                      border: active ? "2px solid #B5894F" : "1px solid #E3D6BD",
                      background: v.key === "3d"
                        ? "linear-gradient(135deg, #3D352A 0%, #5A4F40 100%)"
                        : "#F4ECDC",
                      color: v.key === "3d" ? "#E4C188" : "#7A6B52",
                      fontFamily: SANS,
                      fontSize: 12,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      overflow: "hidden",
                      position: "relative",
                      transition: "border 0.2s ease, transform 0.2s ease",
                    }}
                  >
                    {v.key === "3d" ? (
                      <>
                        <span style={{ fontSize: 16 }}>◈</span>
                        {v.label}
                      </>
                    ) : (
                      <Image
                        src={PHOTO}
                        alt={v.label}
                        fill
                        sizes="120px"
                        style={{ objectFit: "contain", padding: 8, transform: v.key === "side" ? "scaleX(-1)" : "none" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- product details ---- */}
          <div style={{ paddingTop: 10 }}>
            <p style={{ fontSize: 13, letterSpacing: "3.5px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 16 }}>{PRODUCT.tagline}</p>
            <h1 className="pdp-title" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1.05, fontWeight: 500, color: "#2F2820", letterSpacing: "-0.5px", marginBottom: 18 }}>{PRODUCT.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span style={{ color: "#E4C188", letterSpacing: "2px", fontSize: 15 }}>★★★★★</span>
              <span style={{ fontSize: 13.5, color: "#8A7E6C" }}>{PRODUCT.rating} · {PRODUCT.reviews} reviews</span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 30, color: "#2F2820", fontWeight: 500 }}>{money(PRODUCT.price)}</span>
              <span style={{ fontSize: 18, color: "#A89A82", textDecoration: "line-through" }}>{money(PRODUCT.mrp)}</span>
              <span style={{ fontSize: 13, color: "#9C5A3C", fontWeight: 500 }}>Save {pct}%</span>
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#6A5F4F", fontWeight: 300, marginBottom: 30, maxWidth: 460 }}>{PRODUCT.desc}</p>

            {/* quantity + add to cart */}
            <div className="pdp-actions" style={{ display: "flex", gap: 14, alignItems: "stretch", marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #D8CBB2", borderRadius: 2, overflow: "hidden" }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6A5F4F", padding: "0 16px", height: "100%" }}>−</button>
                <span style={{ minWidth: 34, textAlign: "center", fontSize: 15, color: "#2F2820" }}>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6A5F4F", padding: "0 16px", height: "100%" }}>+</button>
              </div>
              <button
                onClick={() => {
                  add({ id: PRODUCT_ID, name: PRODUCT.name, price: PRODUCT.price, img: PHOTO }, qty);
                  showToast(`Added ${qty} × ${PRODUCT.name} to cart`);
                }}
                style={{ flex: 1, background: "#3D352A", color: "#F6EFE2", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 13.5, letterSpacing: "2px", textTransform: "uppercase", padding: "16px 28px", borderRadius: 2, boxShadow: "0 10px 28px rgba(61,53,42,0.28)" }}
              >
                Add to cart · {money(PRODUCT.price * qty)}
              </button>
            </div>

            {/* details list */}
            <div style={{ borderTop: "1px solid #E3D6BD", paddingTop: 24 }}>
              <div style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: "#B5894F", marginBottom: 14, fontWeight: 500 }}>The details</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                {PRODUCT.details.map((d) => (
                  <li key={d} style={{ fontSize: 14.5, color: "#6A5F4F", fontWeight: 300, display: "flex", gap: 10 }}>
                    <span style={{ color: "#B5894F" }}>✦</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 60, background: "#2F2820", color: "#F6EFE2", padding: "15px 26px", borderRadius: 3, fontSize: 14, letterSpacing: "0.5px", boxShadow: "0 14px 40px rgba(47,40,32,0.3)", animation: "toastIn 0.3s ease" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
