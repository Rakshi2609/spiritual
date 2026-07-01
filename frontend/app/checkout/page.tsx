"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, useUser } from "../_components/store";

/* ----------------------------------------------------------------------------
   Checkout — reads the real shared cart, lets you change quantities / remove
   items, and autofills contact details from the logged-in account.
   "Place order" is a demo: it clears the cart and shows a confirmation.
---------------------------------------------------------------------------- */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

const money = (n: number) => "₹" + n.toLocaleString("en-IN");

const FREE_SHIPPING_THRESHOLD = 2499;

const PAY_METHODS: { key: "upi" | "card" | "cod"; label: string; icon: React.ReactNode }[] = [
  {
    key: "upi",
    label: "UPI",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    ),
  },
  {
    key: "card",
    label: "Card",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    key: "cod",
    label: "Cash",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
];

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
  defaultValue,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
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
        defaultValue={defaultValue}
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
      <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: "#2F2820" }}>{children}</h2>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, inc, dec, remove, clear } = useCart();
  const { user, loading } = useUser();

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "cod">("upi");

  const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? 99 : 0;
  const total = subtotal + shipping;

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const lastName = user?.name ? user.name.split(" ").slice(1).join(" ") : "";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    setTimeout(() => {
      clear();
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
        background: "radial-gradient(1200px 700px at 78% 8%, #F8F1E2 0%, #F2E9D8 45%, #EDE3CE 100%)",
      }}
    >
      <main className="co-main" style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 80px" }}>
        {done ? (
          <ConfirmationView total={total} onHome={() => router.push("/")} />
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#8A7E6C", fontSize: 15 }}>Loading…</div>
        ) : !user ? (
          <SignInGate />
        ) : (
          <>
            <h1
              style={{ fontFamily: SERIF, fontSize: "clamp(32px, 7vw, 46px)", fontWeight: 500, color: "#2F2820", marginBottom: 8 }}
            >
              Checkout
            </h1>
            <p style={{ fontSize: 14.5, color: "#8A7E6C", fontWeight: 300, marginBottom: 36 }}>
              {user ? "We've prefilled your details — review and complete your order." : "Review your ritual and complete your order."}
            </p>

            <div className="co-grid">
              {/* ---- left: forms ---- */}
              <form onSubmit={onSubmit} key={user?.id || "guest"}>
                <section style={cardStyle}>
                  <SectionTitle step={1}>Contact</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field label="Email" id="email" type="email" placeholder="you@example.com" autoComplete="email" defaultValue={user?.email} />
                    <Field label="Phone" id="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" />
                  </div>
                </section>

                <section style={cardStyle}>
                  <SectionTitle step={2}>Shipping address</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="co-row">
                      <Field label="First name" id="fname" placeholder="Mara" autoComplete="given-name" defaultValue={firstName} />
                      <Field label="Last name" id="lname" placeholder="Kapoor" autoComplete="family-name" defaultValue={lastName} />
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

                  {/* method selector */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                    {PAY_METHODS.map((m) => {
                      const active = payMethod === m.key;
                      return (
                        <button
                          type="button"
                          key={m.key}
                          onClick={() => setPayMethod(m.key)}
                          aria-pressed={active}
                          style={{
                            border: active ? "2px solid #B5894F" : "1px solid #E0D2B6",
                            background: active ? "#F1E7D4" : "#FBF6EC",
                            borderRadius: 6,
                            padding: "14px 6px",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            fontFamily: SANS,
                            color: active ? "#3D352A" : "#6A5F4F",
                            transition: "border-color 0.2s ease, background 0.2s ease",
                          }}
                        >
                          {m.icon}
                          <span style={{ fontSize: 12.5, letterSpacing: "0.3px", fontWeight: active ? 500 : 400 }}>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {payMethod === "card" && (
                    <>
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
                    </>
                  )}

                  {payMethod === "upi" && (
                    <>
                      <p style={{ fontSize: 13, color: "#9C5A3C", marginBottom: 16, fontWeight: 300 }}>
                        ✦ Demo only — you won&apos;t actually be charged.
                      </p>
                      <Field label="UPI ID" id="upi" placeholder="yourname@upi" autoComplete="off" />
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                          <span
                            key={app}
                            style={{ fontSize: 12, color: "#6A5F4F", border: "1px solid #E0D2B6", borderRadius: 999, padding: "5px 12px", background: "#FBF6EC" }}
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {payMethod === "cod" && (
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        background: "#FBF6EC",
                        border: "1px solid #E0D2B6",
                        borderRadius: 6,
                        padding: "16px 18px",
                      }}
                    >
                      <span style={{ color: "#B5894F", flexShrink: 0, marginTop: 1 }}>✦</span>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6A5F4F", fontWeight: 300 }}>
                        Pay in cash when your order arrives at your doorstep. Please keep the exact amount
                        ready — our delivery partner may not carry change.
                      </p>
                    </div>
                  )}
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
                <p style={{ textAlign: "center", fontSize: 12.5, color: "#8A7E6C", marginTop: 14, fontWeight: 300, letterSpacing: "0.3px" }}>
                  Secure dummy checkout · no real charge
                </p>
              </form>

              {/* ---- right: order summary ---- */}
              <aside className="co-summary" style={{ ...cardStyle, position: "sticky", top: 20 }}>
                <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: "#2F2820", marginBottom: 20 }}>
                  Order summary
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {items.map((l) => (
                    <div key={l.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ position: "relative", width: 56, height: 56, borderRadius: 4, overflow: "hidden", background: "#E8DAC0", flexShrink: 0 }}>
                        {l.img && <Image src={l.img} alt={l.name} fill sizes="56px" style={{ objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 16, color: "#2F2820" }}>{l.name}</div>
                        {/* qty stepper + remove */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid #D8CBB2", borderRadius: 3, overflow: "hidden" }}>
                            <button type="button" onClick={() => dec(l.id)} aria-label="Decrease quantity" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#6A5F4F", padding: "1px 10px" }}>−</button>
                            <span style={{ minWidth: 24, textAlign: "center", fontSize: 13.5, color: "#2F2820" }}>{l.qty}</span>
                            <button type="button" onClick={() => inc(l.id)} aria-label="Increase quantity" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#6A5F4F", padding: "1px 10px" }}>+</button>
                          </div>
                          <button type="button" onClick={() => remove(l.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#B5894F", letterSpacing: "0.3px" }}>Remove</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 15, color: "#3D352A", fontWeight: 500 }}>{money(l.price * l.qty)}</div>
                    </div>
                  ))}
                </div>

                {/* promo */}
                <div style={{ display: "flex", gap: 10, margin: "22px 0 20px" }}>
                  <input className="field-input" placeholder="Promo code" style={{ ...inputStyle, padding: "11px 14px", fontSize: 14 }} />
                  <button
                    type="button"
                    style={{ border: "1px solid #D8CBB2", background: "none", borderRadius: 3, padding: "0 18px", cursor: "pointer", fontFamily: SANS, fontSize: 13, letterSpacing: "1px", textTransform: "uppercase", color: "#6A5F4F" }}
                  >
                    Apply
                  </button>
                </div>

                <div style={{ borderTop: "1px solid #E3D6BD", paddingTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <Row label="Subtotal" value={money(subtotal)} />
                  <Row label="Shipping" value={shipping === 0 ? "Free" : money(shipping)} accent={shipping === 0} />
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

function SignInGate() {
  const NEXT = "?next=/checkout";
  return (
    <div
      style={{
        maxWidth: 460,
        margin: "40px auto 0",
        textAlign: "center",
        background: "#F6EFE2",
        border: "1px solid #EADFC9",
        borderRadius: 10,
        padding: "clamp(32px, 7vw, 48px)",
        boxShadow: "0 30px 70px rgba(120,92,48,0.14)",
      }}
    >
      <div
        style={{
          width: 60, height: 60, borderRadius: 999, margin: "0 auto 22px",
          background: "#EDE2CC", border: "1px solid #E0D2B6",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#B5894F",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p style={{ fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 12 }}>
        One quick step
      </p>
      <h1 style={{ fontFamily: SERIF, fontSize: "clamp(26px, 6vw, 34px)", fontWeight: 500, lineHeight: 1.15, color: "#2F2820", marginBottom: 14 }}>
        Please sign in to check out
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#6A5F4F", fontWeight: 300, marginBottom: 28 }}>
        Sign in or create an account to complete your order. Your cart is saved — you&apos;ll come
        right back here.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link
          href={`/login${NEXT}`}
          style={{ background: "#3D352A", color: "#F6EFE2", textDecoration: "none", fontSize: 13.5, letterSpacing: "2px", textTransform: "uppercase", padding: "16px", borderRadius: 3 }}
        >
          Sign in
        </Link>
        <Link
          href={`/signup${NEXT}`}
          style={{ background: "none", color: "#3D352A", textDecoration: "none", fontSize: 13.5, letterSpacing: "1px", textTransform: "uppercase", padding: "15px", borderRadius: 3, border: "1px solid #C8A87C" }}
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div style={{ maxWidth: 480, margin: "40px auto 0", textAlign: "center", padding: "40px 24px" }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: 999, margin: "0 auto 20px",
          background: "#EDE2CC", border: "1px solid #E0D2B6",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#B5894F",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 7vw, 38px)", fontWeight: 500, color: "#2F2820", marginBottom: 14 }}>
        Your cart is empty
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#6A5F4F", fontWeight: 300, marginBottom: 28 }}>
        Add a crystal, candle or ritual tool and it&apos;ll appear here.
      </p>
      <Link
        href="/"
        style={{ display: "inline-block", background: "#3D352A", color: "#F6EFE2", textDecoration: "none", fontSize: 13.5, letterSpacing: "2px", textTransform: "uppercase", padding: "16px 38px", borderRadius: 3 }}
      >
        Browse the shop
      </Link>
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
        We&apos;ve charged {money(total)} (not really — this is a demo). A confirmation will drift into
        your inbox shortly. May your rituals be radiant. ✦
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
