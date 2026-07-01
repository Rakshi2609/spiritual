"use client";

import Image from "next/image";
import { useCart } from "./store";
import { CATALOG, money, type Product } from "./catalog";

/* ============================================================================
   CrossSellCarousel — "People also bought these together" bundle deals.

   Reads the cart via useCart(), derives complementary products from a curated
   pairings map, and lets the shopper add one at a bundle price (an extra % off
   the normal price) with a single tap. Because the checkout total is derived
   from the cart, adding an item updates the payable amount in real time.

   Renders nothing when the cart is empty or no fresh recommendations remain.

   variant:
     "checkout" (default) — a full card section for the payment page.
     "drawer"             — a compact strip for the slide-out cart.
   ============================================================================ */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

/* Extra saving granted on top of each product's own MRP discount when it's
   added as a bundle alongside something already in the cart. */
const BUNDLE_EXTRA_PCT = 10;

/* Frequently-bought-together map: product id -> complementary product ids. */
const PAIRS: Record<string, string[]> = {
  om: ["candle", "sage"],
  amethyst: ["sage", "candle"],
  sage: ["candle", "amethyst"],
  candle: ["sage", "amethyst"],
};

const bundlePrice = (price: number) => Math.round(price * (1 - BUNDLE_EXTRA_PCT / 100));

type Props = {
  onAdded?: (name: string) => void;
  variant?: "checkout" | "drawer" | "product";
  /** For the "product" variant: derive recommendations from this product's pairings
      instead of the cart contents. */
  anchorId?: string;
};

export default function CrossSellCarousel({ onAdded, variant = "checkout", anchorId }: Props) {
  const { items, add } = useCart();

  const isProduct = variant === "product";

  // The product variant works even with an empty cart; the others need cart items.
  if (!isProduct && items.length === 0) return null;

  // Build the source id list: from the anchor product's pairings (product variant)
  // or from the union of pairings for everything in the cart. Drop anything already
  // in the cart, dedupe, and resolve to catalog products.
  const inCart = new Set(items.map((i) => i.id));
  const recIds: string[] = [];
  if (isProduct) {
    for (const id of PAIRS[anchorId ?? ""] ?? []) {
      if (!inCart.has(id) && !recIds.includes(id)) recIds.push(id);
    }
  } else {
    for (const line of items) {
      for (const id of PAIRS[line.id] ?? []) {
        if (!inCart.has(id) && !recIds.includes(id)) recIds.push(id);
      }
    }
  }
  const recs = recIds
    .map((id) => CATALOG.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  if (recs.length === 0) return null;

  const isDrawer = variant === "drawer";
  const heading =
    variant === "checkout"
      ? "People also bought these together"
      : isProduct
      ? "People also like to buy"
      : "Frequently bought together";
  const subheading =
    variant === "checkout"
      ? `Add one to your order for an extra ${BUNDLE_EXTRA_PCT}% off — your total updates instantly.`
      : isProduct
      ? `Pair it with this and save an extra ${BUNDLE_EXTRA_PCT}%.`
      : `Add one now and save an extra ${BUNDLE_EXTRA_PCT}%.`;
  const ctaLabel = variant === "checkout" ? "Add to Order" : "Add bundle";

  const handleAdd = (p: Product) => {
    add({ id: p.id, name: p.name, price: bundlePrice(p.price), img: p.img }, 1);
    onAdded?.(`Added ${p.name} — extra ${BUNDLE_EXTRA_PCT}% off`);
  };

  const cards = (
    <div
      className="cross-sell-scroll"
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        padding: isDrawer ? "2px 28px 8px" : "2px 2px 6px",
      }}
    >
      {recs.map((p) => {
        const bp = bundlePrice(p.price);
        return (
          <div
            key={p.id}
            className="cross-sell-card"
            style={{
              flex: "0 0 auto",
              width: isDrawer ? 156 : 168,
              scrollSnapAlign: "start",
              background: "#FBF6EC",
              border: "1px solid #EADFC9",
              borderRadius: 4,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 2px rgba(120,92,48,0.04)",
            }}
          >
            <div style={{ position: "relative", height: isDrawer ? 110 : 120, background: "#EDE2CC", overflow: "hidden" }}>
              {p.img && (
                <Image src={p.img} alt={p.name} fill sizes="168px" style={{ objectFit: "cover" }} />
              )}
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  background: "#9C5A3C",
                  color: "#fff",
                  fontSize: 10,
                  letterSpacing: "0.4px",
                  padding: "4px 7px",
                  borderRadius: 2,
                  fontWeight: 500,
                }}
              >
                Save extra {BUNDLE_EXTRA_PCT}%
              </span>
            </div>

            <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 15, color: "#2F2820", lineHeight: 1.25, flex: 1 }}>
                {p.name}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 8 }}>
                <span style={{ fontSize: 15, color: "#3D352A", fontWeight: 500 }}>{money(bp)}</span>
                <span style={{ fontSize: 12, color: "#A89A82", textDecoration: "line-through" }}>{money(p.price)}</span>
              </div>

              <button
                type="button"
                className="add-btn"
                onClick={() => handleAdd(p)}
                style={{
                  width: "100%",
                  marginTop: 10,
                  background: "#3D352A",
                  color: "#F6EFE2",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: SANS,
                  fontSize: 11,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  padding: "10px 8px",
                  borderRadius: 2,
                }}
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const header = isProduct ? (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13, letterSpacing: "3.5px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 10 }}>
        You may also love
      </p>
      <h2 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 500, color: "#2F2820", letterSpacing: "-0.3px" }}>
        {heading}
      </h2>
      <div style={{ fontSize: 13.5, color: "#8A7E6C", marginTop: 6, fontWeight: 300 }}>{subheading}</div>
    </div>
  ) : (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500 }}>
        {heading}
      </div>
      <div style={{ fontSize: "12.5px", color: "#8A7E6C", marginTop: 4, fontWeight: 300 }}>{subheading}</div>
    </div>
  );

  if (variant === "checkout") {
    return (
      <section
        style={{
          background: "#F6EFE2",
          border: "1px solid #EADFC9",
          borderRadius: 8,
          padding: "clamp(20px, 4vw, 28px)",
          marginBottom: 22,
          boxShadow: "0 12px 40px rgba(120,92,48,0.07)",
        }}
      >
        {header}
        {cards}
      </section>
    );
  }

  if (isProduct) {
    // Plain block — the product page provides the surrounding section chrome.
    return (
      <div>
        {header}
        {cards}
      </div>
    );
  }

  // drawer variant
  return (
    <div style={{ padding: "20px 0 4px", borderTop: "1px solid #E3D6BD" }}>
      <div style={{ padding: "0 28px" }}>{header}</div>
      {cards}
    </div>
  );
}
