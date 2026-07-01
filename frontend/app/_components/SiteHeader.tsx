"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, useUser } from "./store";
import { useUI } from "./ui";

/* ============================================================================
   SiteHeader — the universal sticky navbar rendered on every route from the
   root layout. Nav links point at the home-page sections (/#…) so they work
   from any route. The cart button and toasts go through the shared UI context.
   ============================================================================ */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

export default function SiteHeader() {
  const { count } = useCart();
  const { user, logout } = useUser();
  const { openCart, showToast } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // subtle border/shadow once the page is scrolled
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (navRef.current) navRef.current.classList.toggle("scrolled", document.documentElement.scrollTop > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={navRef} className="site-nav">
      <nav className="lp-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 48px", maxWidth: 1280, margin: "0 auto" }}>
        <button
          className="lp-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
        <div className="lp-nav-links" style={{ display: "flex", gap: 38, alignItems: "center", fontSize: 14, letterSpacing: "0.6px", fontWeight: 400 }}>
          <Link className="nav-link" href="/#shop" style={{ color: "#5A4F40", textDecoration: "none" }}>Shop</Link>
          <Link className="nav-link" href="/#crystals" style={{ color: "#5A4F40", textDecoration: "none" }}>Crystals</Link>
          <Link className="nav-link" href="/#ritual" style={{ color: "#5A4F40", textDecoration: "none" }}>Ritual</Link>
          <Link className="nav-link" href="/product" style={{ color: "#B5894F", textDecoration: "none", fontWeight: 500 }}>3D View ◈</Link>
        </div>
        <Link className="lp-logo" href="/" style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, letterSpacing: "3px", color: "#3D352A", textDecoration: "none", textTransform: "uppercase" }}>Lumière</Link>
        <div className="lp-nav-actions" style={{ display: "flex", gap: 26, alignItems: "center" }}>
          <span className="lp-hide-mobile" style={{ fontSize: 14, color: "#5A4F40", cursor: "pointer" }}>Search</span>
          {user ? (
            <span className="lp-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, color: "#3D352A" }}>Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={async () => { await logout(); showToast("Signed out"); }}
                className="nav-link"
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 14, color: "#B5894F" }}
              >
                Log out
              </button>
            </span>
          ) : (
            <Link href="/login" className="nav-link lp-hide-mobile" style={{ fontSize: 14, color: "#5A4F40", textDecoration: "none" }}>Sign in</Link>
          )}
          <button onClick={openCart} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 14, color: "#3D352A", display: "flex", alignItems: "center", gap: 7, position: "relative" }}>
            Cart
            <span style={{ background: "#B5894F", color: "#fff", borderRadius: 999, minWidth: 21, height: 21, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, padding: "0 6px" }}>{count}</span>
          </button>
        </div>
      </nav>

      {/* mobile dropdown menu (shown via CSS only on small screens) */}
      <div className={`lp-mobile-menu${menuOpen ? " open" : ""}`}>
        <Link href="/#shop" onClick={() => setMenuOpen(false)}>Shop</Link>
        <Link href="/#crystals" onClick={() => setMenuOpen(false)}>Crystals</Link>
        <Link href="/#ritual" onClick={() => setMenuOpen(false)}>Ritual</Link>
        <Link href="/product" onClick={() => setMenuOpen(false)} style={{ color: "#B5894F" }}>3D View ◈</Link>
        <span style={{ padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ece0c9" }}>
          <span style={{ fontSize: 15, color: "#5A4F40", cursor: "pointer" }}>Search</span>
        </span>
        {user ? (
          <span style={{ padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, color: "#3D352A" }}>Hi, {user.name.split(" ")[0]}</span>
            <button
              onClick={async () => { setMenuOpen(false); await logout(); showToast("Signed out"); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 15, color: "#B5894F" }}
            >
              Log out
            </button>
          </span>
        ) : (
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: "#3D352A" }}>Sign in</Link>
        )}
      </div>
    </div>
  );
}
