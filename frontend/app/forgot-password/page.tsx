"use client";

import Link from "next/link";
import { useState } from "react";

/* Dummy password-reset UI — no email is actually sent. */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

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
      <header style={{ padding: "22px 24px", maxWidth: 1100, width: "100%", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/login" style={{ fontSize: 14, color: "#5A4F40", textDecoration: "none", letterSpacing: "0.6px" }}>
          ← Back to sign in
        </Link>
        <Link href="/" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, letterSpacing: "3px", color: "#3D352A", textDecoration: "none", textTransform: "uppercase" }}>
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
            padding: "clamp(28px, 6vw, 44px)",
            boxShadow: "0 30px 70px rgba(120,92,48,0.14)",
          }}
        >
          {sent ? (
            <>
              <div
                style={{
                  width: 60, height: 60, borderRadius: 999, margin: "0 auto 22px",
                  background: "linear-gradient(135deg, #C8A87C, #E4C188)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, color: "#2F2820",
                }}
              >
                ✦
              </div>
              <h1 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 500, color: "#2F2820", textAlign: "center", marginBottom: 14 }}>
                Check your inbox
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#6A5F4F", fontWeight: 300, textAlign: "center", marginBottom: 28 }}>
                If an account exists, we&apos;ve sent a reset link. (Demo — no email is actually sent.)
              </p>
              <Link
                href="/login"
                style={{ display: "block", textAlign: "center", background: "#3D352A", color: "#F6EFE2", textDecoration: "none", fontSize: 13.5, letterSpacing: "2px", textTransform: "uppercase", padding: "16px", borderRadius: 3 }}
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, letterSpacing: "3px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 12 }}>
                No worries
              </p>
              <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 500, lineHeight: 1.1, color: "#2F2820", marginBottom: 14 }}>
                Reset your password
              </h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#6A5F4F", fontWeight: 300, marginBottom: 26 }}>
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label
                    htmlFor="email"
                    style={{ fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A7E6C", fontWeight: 500, marginBottom: 8, display: "block" }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    className="auth-input"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={{ width: "100%", background: "#FBF6EC", border: "1px solid #E0D2B6", borderRadius: 3, padding: "14px 16px", fontFamily: SANS, fontSize: 15, color: "#3D352A", outline: "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
                  />
                </div>
                <button
                  type="submit"
                  className="auth-submit"
                  style={{ background: "#3D352A", color: "#F6EFE2", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 13.5, letterSpacing: "2px", textTransform: "uppercase", padding: "16px", borderRadius: 3, transition: "background 0.25s ease" }}
                >
                  Send reset link
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
