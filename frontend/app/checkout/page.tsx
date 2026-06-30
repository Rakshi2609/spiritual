"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/* ----------------------------------------------------------------------------
   Dummy checkout — responsive two-column layout (form + order summary).
   The order is a static sample; "Place order" fakes a short delay and then
   shows a confirmation. No real payment is processed.
---------------------------------------------------------------------------- */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

const money = (n: number) => "₹" + n.toLocaleString("en-IN");

type Line = { id: string; name: string; qty: number; price: number; img: string };

const ORDER: Line[] = [
  { id: "om", name: "Om Pendant Chain", qty: 1, price: 2999, img: "/product_image/necklace.jpeg" },
  { id: "amethyst", name: "Amethyst Cluster", qty: 1, price: 3999, img: "/product_image/amethyst-cluster.jpg" },
  { id: "candle", name: "Moonlight Candle", qty: 2, price: 2499, img: "/product_image/moonlight-candle.webp" },
];

const SHIPPING = 0; // free over ₹2,499

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "#8A7E6C",
  fontWeight: 500,
  marginBottom: 8,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#FBF6EC",
  border: "1px solid #E0D2B6",
  borderRadius: 3,
  padding: "13px 15px",
  fontFamily: SANS,
  fontSize: 15,
  color: "#3D352A",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

function Field({
  label,
  id,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="field-input"
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={inputStyle}
      />
    </div>
  );
}

function SectionTitle({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          background: "#3D352A",
          color: "#F6EFE2",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {step}
      </span>
      <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: "#2F2820" }}>
        {children}
      </h2>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const subtotal = ORDER.reduce((s, l) => s + l.price * l.qty, 0);
  const total = subtotal + SHIPPING;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  };

  return (
    <div
      style={{
        fontFamily: SANS,
        color: "#3D352A",
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 78% 8%, #F8F1E2 0%, #F2E9D8 45%, #EDE3CE 100%)",
      }}
    >
      {/* header */}
      <header
        style={{
          padding: "20px 24px",
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{ fontSize: 14, color: "#5A4F40", textDecoration: "none", letterSpacing: "0.6px" }}
        >
          ← Continue shopping
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: SERIF,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "3px",
            color: "#3D352A",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Lumière
        </Link>
        <Link href="/login" style={{ fontSize: 14, color: "#5A4F40", textDecoration: "none" }}>
          Sign in
        </Link>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px 80px" }}>
        {done ? (
          <ConfirmationView total={total} onHome={() => router.push("/")} />
        ) : (
          <>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(32px, 7vw, 46px)",
                fontWeight: 500,
                color: "#2F2820",
                marginBottom: 8,
              }}
            >
              Checkout
            </h1>
            <p style={{ fontSize: 14.5, color: "#8A7E6C", fontWeight: 300, marginBottom: 36 }}>
              Almost there — review your ritual and complete your order.
            </p>

            <div className="co-grid">
              {/* ---- left: forms ---- */}
              <form onSubmit={onSubmit}>
                <section style={cardStyle}>
                  <SectionTitle step={1}>Contact</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field label="Email" id="email" type="email" placeholder="you@example.com" autoComplete="email" />
                    <Field label="Phone" id="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" />
                  </div>
                </section>

                <section style={cardStyle}>
                  <SectionTitle step={2}>Shipping address</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="co-row">
                      <Field label="First name" id="fname" placeholder="Mara" autoComplete="given-name" />
                      <Field label="Last name" id="lname" placeholder="Kapoor" autoComplete="family-name" />
                    </div>
                    <Field label="Address" id="addr" placeholder="123 Moonstone Lane" autoComplete="street-address" />
                    <div className="co-row">
                      <Field label="City" id="city" placeholder="Mumbai" autoComplete="address-level2" />
                      <Field label="PIN code" id="pin" placeholder="400001" autoComplete="postal-code" />
                    </div>
                  </div>
                </section>

                <section style={cardStyle}>
                  <SectionTitle step={3}>Payment</SectionTitle>
                  <p style={{ fontSize: 13, color: "#9C5A3C", marginBottom: 16, fontWeight: 300 }}>
                    ✦ Demo only — please don&apos;t enter a real card.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field label="Card number" id="card" placeholder="4242 4242 4242 4242" autoComplete="cc-number" />
                    <div className="co-row">
                      <Field label="Expiry" id="exp" placeholder="MM / YY" autoComplete="cc-exp" />
                      <Field label="CVC" id="cvc" placeholder="123" autoComplete="cc-csc" />
                    </div>
                  </div>
                </section>

                <button
                  type="submit"
                  className="pay-btn"
                  disabled={busy}
                  style={{
                    width: "100%",
                    background: "#3D352A",
                    color: "#F6EFE2",
                    border: "none",
                    cursor: busy ? "default" : "pointer",
                    opacity: busy ? 0.75 : 1,
                    fontFamily: SANS,
                    fontSize: 14,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "18px",
                    borderRadius: 3,
                    boxShadow: "0 10px 28px rgba(61,53,42,0.28)",
                    transition: "background 0.25s ease",
                  }}
                >
                  {busy ? "Placing order…" : `Place order · ${money(total)}`}
                </button>
                <p style={{ textAlign: "center", fontSize: 12.5, color: "#8A7E6C", marginTop: 14, fontWeight: 300 }}>
                  🔒 Secure dummy checkout · no real charge
                </p>
              </form>

              {/* ---- right: order summary ---- */}
              <aside className="co-summary" style={{ ...cardStyle, position: "sticky", top: 20 }}>
                <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: "#2F2820", marginBottom: 20 }}>
                  Order summary
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {ORDER.map((l) => (
                    <div key={l.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div
                        style={{
                          position: "relative",
                          width: 56,
                          height: 56,
                          borderRadius: 4,
                          overflow: "hidden",
                          background: "#E8DAC0",
                          flexShrink: 0,
                          backgroundImage: `url(${l.img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 16, color: "#2F2820" }}>{l.name}</div>
                        <div style={{ fontSize: 13, color: "#8A7E6C", marginTop: 2 }}>Qty {l.qty}</div>
                      </div>
                      <div style={{ fontSize: 15, color: "#3D352A", fontWeight: 500 }}>
                        {money(l.price * l.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* promo */}
                <div style={{ display: "flex", gap: 10, margin: "22px 0 20px" }}>
                  <input
                    className="field-input"
                    placeholder="Promo code"
                    style={{ ...inputStyle, padding: "11px 14px", fontSize: 14 }}
                  />
                  <button
                    type="button"
                    style={{
                      border: "1px solid #D8CBB2",
                      background: "none",
                      borderRadius: 3,
                      padding: "0 18px",
                      cursor: "pointer",
                      fontFamily: SANS,
                      fontSize: 13,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "#6A5F4F",
                    }}
                  >
                    Apply
                  </button>
                </div>

                <div style={{ borderTop: "1px solid #E3D6BD", paddingTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <Row label="Subtotal" value={money(subtotal)} />
                  <Row label="Shipping" value={SHIPPING === 0 ? "Free" : money(SHIPPING)} accent={SHIPPING === 0} />
                  <div style={{ borderTop: "1px solid #E3D6BD", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: "#2F2820" }}>Total</span>
                    <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: "#2F2820" }}>{money(total)}</span>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#F6EFE2",
  border: "1px solid #EADFC9",
  borderRadius: 8,
  padding: "clamp(22px, 4vw, 30px)",
  marginBottom: 22,
  boxShadow: "0 12px 40px rgba(120,92,48,0.07)",
};

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
      <span style={{ color: "#6A5F4F", fontWeight: 300 }}>{label}</span>
      <span style={{ color: accent ? "#6F8A6A" : "#3D352A", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ConfirmationView({ total, onHome }: { total: number; onHome: () => void }) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "40px auto 0",
        textAlign: "center",
        background: "#F6EFE2",
        border: "1px solid #EADFC9",
        borderRadius: 10,
        padding: "clamp(36px, 8vw, 60px)",
        boxShadow: "0 30px 70px rgba(120,92,48,0.14)",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          margin: "0 auto 26px",
          background: "linear-gradient(135deg, #C8A87C, #E4C188)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          color: "#2F2820",
          boxShadow: "0 12px 30px rgba(200,168,124,0.45)",
        }}
      >
        ✦
      </div>
      <p style={{ fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 12 }}>
        Order confirmed
      </p>
      <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 7vw, 40px)", fontWeight: 500, color: "#2F2820", marginBottom: 16 }}>
        Thank you for your order
      </h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#6A5F4F", fontWeight: 300, marginBottom: 28 }}>
        We&apos;ve charged {money(total)} (not really — this is a demo). A confirmation will drift
        into your inbox shortly. May your rituals be radiant. ✦
      </p>
      <button
        onClick={onHome}
        className="pay-btn"
        style={{
          background: "#3D352A",
          color: "#F6EFE2",
          border: "none",
          cursor: "pointer",
          fontFamily: SANS,
          fontSize: 13.5,
          letterSpacing: "2px",
          textTransform: "uppercase",
          padding: "16px 38px",
          borderRadius: 3,
          transition: "background 0.25s ease",
        }}
      >
        Back to shop
      </button>
    </div>
  );
}
