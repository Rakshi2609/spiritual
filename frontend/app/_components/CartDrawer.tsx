"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./store";
import { money } from "./catalog";
import CrossSellCarousel from "./CrossSellCarousel";

/* ============================================================================
   CartDrawer — the slide-out cart used across pages. Controlled via `open` /
   `onClose`; reads the shared cart directly. Includes the "frequently bought
   together" carousel and a Checkout link. `onAdded` surfaces a toast from the
   carousel on the host page.
   ============================================================================ */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded?: (msg: string) => void;
};

export default function CartDrawer({ open, onClose, onAdded }: Props) {
  const { items, count, subtotal, inc, dec, remove } = useCart();

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: open ? "auto" : "none", opacity: open ? 1 : 0, transition: "opacity 0.3s ease", background: "rgba(47,40,32,0.4)" }}
      />
      <aside style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 400, maxWidth: "92vw", zIndex: 51, background: "#F6EFE2", boxShadow: "-20px 0 60px rgba(47,40,32,0.18)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.34s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "26px 28px", borderBottom: "1px solid #E3D6BD", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: SERIF, fontSize: 24, color: "#2F2820" }}>Your cart {count ? "(" + count + ")" : ""}</div>
          <button onClick={onClose} aria-label="Close cart" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#6A5F4F", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 28px" }}>
          {count === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#8A7E6C", fontWeight: 300, fontSize: "14.5px" }}>Your cart is quietly empty.</div>
          ) : (
            items.map((line) => (
              <div key={line.id} style={{ display: "flex", gap: 14, padding: "18px 0", borderBottom: "1px solid #EADFC9", alignItems: "center" }}>
                <div style={{ position: "relative", width: 60, height: 60, background: "#E8DAC0", borderRadius: 3, flexShrink: 0, overflow: "hidden" }}>
                  {line.img && <Image src={line.img} alt={line.name} fill sizes="60px" style={{ objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 18, color: "#2F2820" }}>{line.name}</div>
                  <div style={{ fontSize: 13, color: "#8A7E6C", marginTop: 2 }}>{money(line.price)} each</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 8, border: "1px solid #D8CBB2", borderRadius: 3, width: "fit-content", overflow: "hidden" }}>
                    <button onClick={() => dec(line.id)} aria-label="Decrease quantity" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6A5F4F", padding: "2px 12px" }}>−</button>
                    <span style={{ minWidth: 26, textAlign: "center", fontSize: 14, color: "#2F2820" }}>{line.qty}</span>
                    <button onClick={() => inc(line.id)} aria-label="Increase quantity" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6A5F4F", padding: "2px 12px" }}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <div style={{ fontSize: 15, color: "#3D352A", fontWeight: 500 }}>{money(line.price * line.qty)}</div>
                  <button onClick={() => remove(line.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#B5894F", letterSpacing: "0.5px" }}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <CrossSellCarousel variant="drawer" onAdded={onAdded} />
        <div style={{ padding: "22px 28px 28px", borderTop: "1px solid #E3D6BD" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, fontSize: 15 }}>
            <span style={{ color: "#6A5F4F", fontWeight: 300 }}>Subtotal</span>
            <span style={{ color: "#2F2820", fontWeight: 500 }}>{money(subtotal)}</span>
          </div>
          <Link href="/checkout" style={{ display: "block", width: "100%", textAlign: "center", background: "#3D352A", color: "#F6EFE2", textDecoration: "none", fontFamily: SANS, fontSize: "13.5px", letterSpacing: "2px", textTransform: "uppercase", padding: 16, borderRadius: 2 }}>Checkout</Link>
          <p style={{ textAlign: "center", fontSize: 12, color: "#8A7E6C", marginTop: 12, fontWeight: 300 }}>Shipping &amp; taxes calculated at checkout</p>
        </div>
      </aside>
    </>
  );
}
