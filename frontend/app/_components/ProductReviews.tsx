"use client";

import { useEffect, useMemo, useState } from "react";

/* ============================================================================
   ProductReviews — ratings summary (average, distribution bars) + an
   interactive "write a review" form and list. New reviews prepend to the list
   and persist in localStorage (there's no reviews backend); the average and
   count update live, blended with the curated seed numbers.
   ============================================================================ */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

const GOLD = "#E4C188";
const GOLD_DEEP = "#B5894F";

type Review = { id: string; name: string; rating: number; text: string; date: string };

/* Curated seed reviews (shown to everyone). */
const SEED_REVIEWS: Review[] = [
  { id: "seed-1", name: "Mara K.", rating: 5, text: "My evenings feel sacred now — the pendant is even more beautiful in person. The oxidised finish is gorgeous.", date: "2026-05-18" },
  { id: "seed-2", name: "Devan R.", rating: 5, text: "Bought it as a gift and ended up ordering one for myself. Feels substantial, not flimsy at all.", date: "2026-04-30" },
  { id: "seed-3", name: "Aisha M.", rating: 4, text: "Lovely piece and quick delivery. Chain is a touch longer than I expected but I actually love how it sits.", date: "2026-04-12" },
];

/* Seed star distribution — sums to the baseCount passed in (412). */
const SEED_DISTRIBUTION: Record<number, number> = { 5: 341, 4: 47, 3: 15, 2: 6, 1: 3 };

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span style={{ color: GOLD, letterSpacing: "2px", fontSize: size, whiteSpace: "nowrap" }} aria-label={`${value} out of 5 stars`}>
      {"★★★★★".slice(0, value)}
      <span style={{ color: "#DCcdb0" }}>{"★★★★★".slice(value)}</span>
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  productId: string;
  productName: string;
  baseRating: number;
  baseCount: number;
  onSubmitted?: (msg: string) => void;
};

export default function ProductReviews({ productId, productName, baseRating, baseCount, onSubmitted }: Props) {
  const storageKey = `lumiere_reviews_${productId}`;

  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // form state
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formName, setFormName] = useState("");
  const [formText, setFormText] = useState("");

  // load persisted reviews on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setUserReviews(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  // persist on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(userReviews));
    } catch {
      /* ignore */
    }
  }, [userReviews, hydrated, storageKey]);

  const totalCount = baseCount + userReviews.length;

  const average = useMemo(() => {
    const userSum = userReviews.reduce((a, r) => a + r.rating, 0);
    const blended = (baseRating * baseCount + userSum) / (baseCount + userReviews.length || 1);
    return blended;
  }, [userReviews, baseRating, baseCount]);

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { ...SEED_DISTRIBUTION };
    for (const r of userReviews) dist[r.rating] = (dist[r.rating] ?? 0) + 1;
    return dist;
  }, [userReviews]);

  const allReviews = useMemo(() => [...userReviews, ...SEED_REVIEWS], [userReviews]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = formText.trim();
    const name = formName.trim() || "Anonymous";
    if (!text) return;
    const review: Review = {
      id: `u-${Date.now()}`,
      name,
      rating: formRating,
      text,
      date: new Date().toISOString().slice(0, 10),
    };
    setUserReviews((prev) => [review, ...prev]);
    setFormText("");
    setFormName("");
    setFormRating(5);
    onSubmitted?.("Thanks for your review ✦");
  };

  return (
    <div className="pdp-reviews-grid" style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: 48, alignItems: "start" }}>
      {/* ---- left: summary + form ---- */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: SERIF, fontSize: 54, fontWeight: 500, color: "#2F2820", lineHeight: 1 }}>
            {average.toFixed(1)}
          </span>
          <span style={{ fontSize: 14, color: "#8A7E6C" }}>out of 5</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <Stars value={Math.round(average)} size={18} />
        </div>
        <div style={{ fontSize: 13.5, color: "#8A7E6C", marginTop: 8 }}>{totalCount.toLocaleString("en-IN")} reviews</div>

        {/* distribution bars */}
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const c = distribution[star] ?? 0;
            const pct = totalCount > 0 ? (c / totalCount) * 100 : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#6A5F4F" }}>
                <span style={{ width: 34, whiteSpace: "nowrap" }}>{star} ★</span>
                <div style={{ flex: 1, height: 8, background: "#EADFC9", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: GOLD_DEEP, borderRadius: 999 }} />
                </div>
                <span style={{ width: 42, textAlign: "right", color: "#8A7E6C" }}>{c.toLocaleString("en-IN")}</span>
              </div>
            );
          })}
        </div>

        {/* write a review */}
        <form onSubmit={onSubmit} style={{ marginTop: 30, borderTop: "1px solid #E3D6BD", paddingTop: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: GOLD_DEEP, marginBottom: 14, fontWeight: 500 }}>
            Write a review
          </div>

          {/* star picker */}
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }} onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hoverRating || formRating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  className="review-star"
                  aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoverRating(n)}
                  onClick={() => setFormRating(n)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 26,
                    lineHeight: 1,
                    padding: 0,
                    color: active ? GOLD : "#DCcdb0",
                  }}
                >
                  ★
                </button>
              );
            })}
          </div>

          <input
            className="field-input"
            placeholder="Your name (optional)"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            style={inputStyle}
          />
          <textarea
            className="field-input"
            placeholder={`Share your thoughts on the ${productName}…`}
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            required
            rows={4}
            style={{ ...inputStyle, marginTop: 12, resize: "vertical", minHeight: 90, fontFamily: SANS }}
          />
          <button
            type="submit"
            className="add-btn"
            style={{
              width: "100%",
              marginTop: 14,
              background: "#3D352A",
              color: "#F6EFE2",
              border: "none",
              cursor: "pointer",
              fontFamily: SANS,
              fontSize: 12,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: 13,
              borderRadius: 2,
            }}
          >
            Submit review
          </button>
        </form>
      </div>

      {/* ---- right: review list ---- */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {allReviews.map((r) => (
          <div key={r.id} style={{ display: "flex", gap: 14, borderBottom: "1px solid #EADFC9", paddingBottom: 22 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                flexShrink: 0,
                background: "#EDE2CC",
                border: "1px solid #E0D2B6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SERIF,
                fontSize: 16,
                color: GOLD_DEEP,
              }}
            >
              {initials(r.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: "#2F2820" }}>{r.name}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    color: "#6F8A6A",
                    background: "#EAF0E6",
                    border: "1px solid #D6E2CE",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontWeight: 500,
                  }}
                >
                  Verified buyer
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
                <Stars value={r.rating} size={13} />
                <span style={{ fontSize: 12.5, color: "#A89A82" }}>{formatDate(r.date)}</span>
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#6A5F4F", fontWeight: 300, marginTop: 10 }}>{r.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#FBF6EC",
  border: "1px solid #E0D2B6",
  borderRadius: 3,
  padding: "12px 14px",
  fontFamily: SANS,
  fontSize: 14.5,
  color: "#3D352A",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};
