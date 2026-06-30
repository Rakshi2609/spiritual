"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "./store";

/* ----------------------------------------------------------------------------
   Shared auth card for /login and /signup.

   Real: email + password auth against MongoDB (POST /api/auth/{login,signup}),
   bcrypt-hashed, JWT in an httpOnly cookie.
   Stubbed (polished UI only): Google sign-in, phone-number + OTP login.
---------------------------------------------------------------------------- */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

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
  padding: "14px 16px",
  fontFamily: SANS,
  fontSize: 15,
  color: "#3D352A",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

type Strength = { score: number; label: string; color: string };

function passwordStrength(pw: string): Strength {
  if (!pw) return { score: 0, label: "", color: "#E0D2B6" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);
  const map: Strength[] = [
    { score: 0, label: "Too weak", color: "#C0563B" },
    { score: 1, label: "Weak", color: "#C0563B" },
    { score: 2, label: "Fair", color: "#C89A4A" },
    { score: 3, label: "Good", color: "#8A9A5B" },
    { score: 4, label: "Strong", color: "#6F8A6A" },
  ];
  return map[score];
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "••••••••",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={labelStyle} htmlFor={id}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          className="auth-input"
          type={show ? "text" : "password"}
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ ...inputStyle, paddingRight: 46 }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 6,
            top: 0,
            height: "100%",
            width: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#8A7E6C",
          }}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { refresh } = useUser();
  const isSignup = mode === "signup";

  // where to go after auth — supports /login?next=/checkout (same-origin only)
  const [nextUrl, setNextUrl] = useState("/");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("next");
    if (p && p.startsWith("/") && !p.startsWith("//")) setNextUrl(p);
  }, []);

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const strength = useMemo(() => passwordStrength(password), [password]);

  // phone (stub) state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<"enter" | "otp">("enter");

  const reset = () => {
    setError(null);
    setInfo(null);
  };

  /* ---- real email/password auth ---- */
  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string | null;
    const email = form.get("email") as string;

    if (isSignup) {
      if (password !== confirm) return setError("Passwords don't match.");
      if (strength.score < 2) return setError("Please choose a stronger password (8+ chars, mix it up).");
    }

    setBusy(true);
    try {
      const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      await refresh(); // update nav/user context before leaving
      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setBusy(false);
    }
  }

  /* ---- stubbed phone OTP ---- */
  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    if (phoneStep === "enter") {
      if (phone.replace(/\D/g, "").length < 10) return setError("Enter a valid 10-digit mobile number.");
      setPhoneStep("otp");
      setInfo("Demo OTP sent ✦ — use code 123456");
      return;
    }
    // verify
    if (otp.trim() !== "123456") return setError("Incorrect code. (Demo code: 123456)");
    setBusy(true);
    setTimeout(() => {
      router.push(nextUrl);
      router.refresh();
    }, 500);
  }

  function googleStub() {
    reset();
    setInfo("Google sign-in is a demo stub for now — please use email & password.");
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "11px 0",
    textAlign: "center",
    background: active ? "#3D352A" : "transparent",
    color: active ? "#F6EFE2" : "#8A7E6C",
    border: "none",
    cursor: "pointer",
    fontFamily: SANS,
    fontSize: 13,
    letterSpacing: "1px",
    textTransform: "uppercase",
    borderRadius: 3,
    transition: "background 0.2s ease, color 0.2s ease",
  });

  return (
    <div
      style={{
        fontFamily: SANS,
        color: "#3D352A",
        minHeight: "100vh",
        background: "radial-gradient(1200px 700px at 78% 8%, #F8F1E2 0%, #F2E9D8 45%, #EDE3CE 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "22px 24px",
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ fontSize: 14, color: "#5A4F40", textDecoration: "none", letterSpacing: "0.6px" }}>
          ← Back to shop
        </Link>
        <Link
          href="/"
          style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, letterSpacing: "3px", color: "#3D352A", textDecoration: "none", textTransform: "uppercase" }}
        >
          Lumière
        </Link>
        <div style={{ width: 90 }} />
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px 64px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#F6EFE2",
            border: "1px solid #EADFC9",
            borderRadius: 8,
            padding: "clamp(26px, 6vw, 42px)",
            boxShadow: "0 30px 70px rgba(120,92,48,0.14)",
          }}
        >
          <p style={{ fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 12 }}>
            {isSignup ? "Begin your ritual" : "Welcome back"}
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(30px, 7vw, 40px)", fontWeight: 500, lineHeight: 1.1, color: "#2F2820", marginBottom: 24 }}>
            {isSignup ? "Create your account" : "Sign in"}
          </h1>

          {/* method tabs */}
          <div style={{ display: "flex", gap: 6, padding: 4, background: "#EDE2CC", borderRadius: 5, marginBottom: 22 }}>
            <button type="button" style={tabBtn(method === "email")} onClick={() => { setMethod("email"); reset(); }}>
              Email
            </button>
            <button type="button" style={tabBtn(method === "phone")} onClick={() => { setMethod("phone"); reset(); }}>
              Mobile number
            </button>
          </div>

          {/* banners */}
          {error && <Banner tone="error">{error}</Banner>}
          {info && <Banner tone="info">{info}</Banner>}

          {method === "email" ? (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {isSignup && (
                <div>
                  <label style={labelStyle} htmlFor="name">Full name</label>
                  <input id="name" name="name" className="auth-input" type="text" required placeholder="Mara Kapoor" autoComplete="name" style={inputStyle} />
                </div>
              )}

              <div>
                <label style={labelStyle} htmlFor="email">Email</label>
                <input id="email" name="email" className="auth-input" type="email" required placeholder="you@example.com" autoComplete="email" style={inputStyle} />
              </div>

              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />

              {/* strength meter (signup only) */}
              {isSignup && password.length > 0 && (
                <div style={{ marginTop: -6 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 5,
                          borderRadius: 999,
                          background: i < strength.score ? strength.color : "#E3D6BD",
                          transition: "background 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, color: strength.color, marginTop: 7, letterSpacing: "0.3px" }}>
                    Password strength: {strength.label}
                  </div>
                </div>
              )}

              {isSignup && (
                <div>
                  <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
                  {confirm.length > 0 && (
                    <div style={{ fontSize: 12.5, marginTop: 7, color: confirm === password ? "#6F8A6A" : "#C0563B" }}>
                      {confirm === password ? "Passwords match ✓" : "Passwords don't match"}
                    </div>
                  )}
                </div>
              )}

              {!isSignup && (
                <div style={{ textAlign: "right", marginTop: -6 }}>
                  <Link href="/forgot-password" style={{ fontSize: 13, color: "#B5894F", textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>
              )}

              <SubmitBtn busy={busy}>{isSignup ? "Create account" : "Sign in"}</SubmitBtn>
            </form>
          ) : (
            /* ---- phone / OTP (stub) ---- */
            <form onSubmit={handlePhoneSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {phoneStep === "enter" ? (
                <div>
                  <label style={labelStyle} htmlFor="phone">Mobile number</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ ...inputStyle, width: 64, display: "flex", alignItems: "center", justifyContent: "center", color: "#6A5F4F" }}>+91</span>
                    <input
                      id="phone"
                      className="auth-input"
                      type="tel"
                      required
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      autoComplete="tel"
                      style={inputStyle}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={labelStyle} htmlFor="otp">Enter 6-digit code</label>
                  <input
                    id="otp"
                    className="auth-input"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    style={{ ...inputStyle, letterSpacing: "8px", textAlign: "center", fontSize: 20 }}
                  />
                  <button
                    type="button"
                    onClick={() => { setPhoneStep("enter"); reset(); }}
                    style={{ marginTop: 10, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#B5894F" }}
                  >
                    ← Change number
                  </button>
                </div>
              )}

              <SubmitBtn busy={busy}>{phoneStep === "enter" ? "Send OTP" : "Verify & continue"}</SubmitBtn>
            </form>
          )}

          {/* divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E3D6BD" }} />
            <span style={{ fontSize: 12, color: "#A89A82", letterSpacing: "1px" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#E3D6BD" }} />
          </div>

          {/* Google (stub) */}
          <button
            type="button"
            onClick={googleStub}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "#fff",
              border: "1px solid #D8CBB2",
              borderRadius: 3,
              padding: "13px",
              cursor: "pointer",
              fontFamily: SANS,
              fontSize: 14.5,
              color: "#3D352A",
              fontWeight: 500,
            }}
          >
            <GoogleMark />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              width: "100%",
              marginTop: 12,
              background: "none",
              border: "1px solid #E0D2B6",
              borderRadius: 3,
              padding: "13px",
              cursor: "pointer",
              fontFamily: SANS,
              fontSize: 14,
              color: "#6A5F4F",
            }}
          >
            Continue as guest
          </button>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#6A5F4F" }}>
            {isSignup ? "Already have an account? " : "New to Lumière? "}
            <Link
              href={(isSignup ? "/login" : "/signup") + (nextUrl !== "/" ? `?next=${encodeURIComponent(nextUrl)}` : "")}
              style={{ color: "#B5894F", textDecoration: "none", fontWeight: 500 }}
            >
              {isSignup ? "Sign in" : "Create one"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function SubmitBtn({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="auth-submit"
      disabled={busy}
      style={{
        marginTop: 4,
        background: "#3D352A",
        color: "#F6EFE2",
        border: "none",
        cursor: busy ? "default" : "pointer",
        opacity: busy ? 0.75 : 1,
        fontFamily: SANS,
        fontSize: 13.5,
        letterSpacing: "2px",
        textTransform: "uppercase",
        padding: "16px",
        borderRadius: 3,
        transition: "background 0.25s ease",
      }}
    >
      {busy ? "One moment…" : children}
    </button>
  );
}

function Banner({ tone, children }: { tone: "error" | "info"; children: React.ReactNode }) {
  const c =
    tone === "error"
      ? { bg: "#F7E3DC", border: "#E3B7A8", color: "#9C4A30" }
      : { bg: "#EFE8D3", border: "#DAC9A4", color: "#7A6B52" };
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        borderRadius: 4,
        padding: "11px 14px",
        fontSize: 13.5,
        lineHeight: 1.5,
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 16 2 9.1 6.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 46c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9 41.3 15.9 46 24 46z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.9 36.3 46 30.7 46 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
