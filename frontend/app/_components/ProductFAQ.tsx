"use client";

import { useState } from "react";

/* ============================================================================
   ProductFAQ — a simple expand/collapse accordion. Only one item is open at a
   time; clicking an open item closes it.
   ============================================================================ */

const SERIF = "var(--font-display), Georgia, serif";

export type FaqItem = { q: string; a: string };

export default function ProductFAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ borderTop: "1px solid #E3D6BD" }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="faq-item" style={{ borderBottom: "1px solid #E3D6BD" }}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "22px 4px",
                fontFamily: SERIF,
                fontSize: 19,
                color: "#2F2820",
              }}
            >
              <span>{item.q}</span>
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  color: "#B5894F",
                  fontSize: 20,
                  lineHeight: 1,
                  transition: "transform 0.28s ease",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                +
              </span>
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.3s ease",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: "#6A5F4F", fontWeight: 300, padding: "0 4px 24px", maxWidth: 720 }}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
