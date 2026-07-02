"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "./store";
import { useUI } from "./ui";
import { CATALOG, money, type Product } from "./catalog";

/* ============================================================================
   ProductQuiz — "Confused on what to buy?" banner + a step-by-step modal quiz
   that scores answers against the existing CATALOG and recommends the best
   match (+ a runner-up) with an Add to cart CTA. Self-contained: uses the cart
   and the global toast directly.
   ============================================================================ */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

type Weights = Partial<Record<string, number>>;
type Question = { q: string; options: { label: string; weights: Weights }[] };

const QUESTIONS: Question[] = [
  {
    q: "What do you want to invite into your space?",
    options: [
      { label: "Calm & clarity", weights: { amethyst: 2, candle: 1 } },
      { label: "Focus & intention", weights: { om: 2, sage: 1 } },
      { label: "A fresh reset", weights: { sage: 2, amethyst: 1 } },
      { label: "Warmth & ambience", weights: { candle: 2, om: 1 } },
    ],
  },
  {
    q: "When do you most need your ritual?",
    options: [
      { label: "Morning grounding", weights: { om: 2, sage: 1 } },
      { label: "Winding down at night", weights: { candle: 2, amethyst: 1 } },
      { label: "Moments of anxiety", weights: { amethyst: 2, candle: 1 } },
      { label: "Starting something new", weights: { sage: 2, om: 1 } },
    ],
  },
  {
    q: "Pick what draws you most:",
    options: [
      { label: "Something to wear", weights: { om: 2 } },
      { label: "A crystal for my nightstand", weights: { amethyst: 2 } },
      { label: "A cleansing ritual", weights: { sage: 2 } },
      { label: "A cozy glow", weights: { candle: 2 } },
    ],
  },
  {
    q: "Your ideal evening feels…",
    options: [
      { label: "Meditative & still", weights: { om: 1, amethyst: 1 } },
      { label: "Soft & candlelit", weights: { candle: 2 } },
      { label: "Clean & clear", weights: { sage: 2 } },
      { label: "Grounded & centered", weights: { amethyst: 2 } },
    ],
  },
];

/* Rank CATALOG products by the accumulated weights of the chosen options. */
function rankProducts(answers: (number | null)[]): Product[] {
  const scores: Record<string, number> = {};
  for (const p of CATALOG) scores[p.id] = 0;
  answers.forEach((choice, i) => {
    if (choice == null) return;
    const w = QUESTIONS[i].options[choice].weights;
    for (const id in w) scores[id] = (scores[id] ?? 0) + (w[id] ?? 0);
  });
  // stable sort by score desc; CATALOG order breaks ties
  return [...CATALOG].sort((a, b) => scores[b.id] - scores[a.id]);
}

export default function ProductQuiz() {
  const { add } = useCart();
  const { showToast } = useUI();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));

  const done = step >= QUESTIONS.length;
  const ranked = done ? rankProducts(answers) : [];
  const primary = ranked[0];
  const runnerUp = ranked[1];

  // lock body scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const reset = () => {
    setStep(0);
    setAnswers(QUESTIONS.map(() => null));
  };

  const openQuiz = () => {
    reset();
    setOpen(true);
  };

  const choose = (optIdx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optIdx;
      return next;
    });
    setStep((s) => s + 1);
  };

  const addToCart = (p: Product) => {
    add({ id: p.id, name: p.name, price: p.price, img: p.img });
    showToast("Added " + p.name + " to cart");
  };

  const progress = Math.min(100, ((done ? QUESTIONS.length : step) / QUESTIONS.length) * 100);

  return (
    <>
      {/* ---------- banner ---------- */}
      <section className="reveal">
        <div className="quiz-banner" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(18px, 5vw, 48px)" }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 10,
              padding: "clamp(28px, 6vw, 60px)",
              background: "radial-gradient(900px 400px at 15% 0%, #4A4030 0%, #2F2820 60%)",
              boxShadow: "0 24px 60px rgba(47,40,32,0.28)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              alignContent: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 380,
                height: 380,
                top: -160,
                right: -80,
                background: "radial-gradient(circle, rgba(200,168,124,0.28) 0%, rgba(200,168,124,0) 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", maxWidth: 560, flex: "1 1 300px", minWidth: 0 }}>
              <p style={{ fontSize: "clamp(11px, 3vw, 13px)", letterSpacing: "3.5px", textTransform: "uppercase", color: "#E4C188", fontWeight: 500, marginBottom: 16 }}>
                Not sure where to start?
              </p>
              <h2 className="h-section" style={{ fontFamily: SERIF, fontSize: "clamp(28px, 8vw, 44px)", lineHeight: 1.08, fontWeight: 500, color: "#F6EFE2", marginBottom: 16 }}>
                Confused on what to buy?
              </h2>
              <p style={{ fontSize: "clamp(14px, 4vw, 16.5px)", lineHeight: 1.7, color: "#C7B998", fontWeight: 300, maxWidth: 460 }}>
                Answer four quick questions and we&apos;ll match you with the ritual pieces made
                for your intention.
              </p>
            </div>
            <button
              onClick={openQuiz}
              className="cta-primary"
              style={{
                position: "relative",
                flexShrink: 0,
                background: "#C8A87C",
                color: "#2F2820",
                border: "none",
                cursor: "pointer",
                fontFamily: SANS,
                fontSize: "clamp(12px, 3vw, 14px)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontWeight: 500,
                padding: "clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px)",
                borderRadius: 3,
                boxShadow: "0 12px 30px rgba(200,168,124,0.35)",
              }}
            >
              Take the 30-second quiz →
            </button>
          </div>
        </div>
      </section>

      {/* ---------- modal ---------- */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 70, pointerEvents: open ? "auto" : "none", opacity: open ? 1 : 0, transition: "opacity 0.3s ease", background: "rgba(47,40,32,0.55)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Find your match quiz"
        style={{
          position: "fixed",
          zIndex: 71,
          top: "50%",
          left: "50%",
          width: 560,
          maxWidth: "92vw",
          maxHeight: "88vh",
          overflowY: "auto",
          transform: open ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -48%) scale(0.98)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.2,0.7,0.2,1)",
          background: "#F6EFE2",
          borderRadius: 12,
          boxShadow: "0 40px 90px rgba(47,40,32,0.35)",
        }}
      >
        {/* progress */}
        <div style={{ height: 5, background: "#EADFC9", borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #B5894F, #E4C188)", transition: "width 0.35s ease" }} />
        </div>

        <div style={{ padding: "clamp(24px, 4vw, 34px)" }}>
          {/* header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500 }}>
              {done ? "Your match" : `Question ${step + 1} of ${QUESTIONS.length}`}
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close quiz" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#6A5F4F", lineHeight: 1 }}>×</button>
          </div>

          {!done ? (
            <div className="quiz-fade" key={step}>
              <h3 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, color: "#2F2820", lineHeight: 1.2, marginBottom: 22 }}>
                {QUESTIONS[step].q}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {QUESTIONS[step].options.map((opt, i) => (
                  <button
                    key={opt.label}
                    className={`quiz-option${answers[step] === i ? " selected" : ""}`}
                    onClick={() => choose(i)}
                    style={{
                      textAlign: "left",
                      background: "#FBF6EC",
                      border: "1px solid #E0D2B6",
                      borderRadius: 6,
                      padding: "16px 18px",
                      cursor: "pointer",
                      fontFamily: SANS,
                      fontSize: 15.5,
                      color: "#3D352A",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  style={{ marginTop: 20, background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 13, letterSpacing: "0.5px", color: "#8A7E6C" }}
                >
                  ← Back
                </button>
              )}
            </div>
          ) : (
            <div className="quiz-fade">
              <p style={{ fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", color: "#B5894F", fontWeight: 500, marginBottom: 6 }}>
                Your perfect match ✦
              </p>

              {/* primary match */}
              {primary && (
                <div style={{ display: "flex", gap: 16, background: "#FBF6EC", border: "1px solid #EADFC9", borderRadius: 8, padding: 16, marginTop: 12 }}>
                  <div style={{ position: "relative", width: 96, height: 96, borderRadius: 6, overflow: "hidden", background: "#EDE2CC", flexShrink: 0 }}>
                    {primary.img && <Image src={primary.img} alt={primary.name} fill sizes="96px" style={{ objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 20, color: "#2F2820", lineHeight: 1.2 }}>{primary.name}</div>
                    <div style={{ fontSize: 13, color: "#8A7E6C", fontWeight: 300, marginTop: 4, lineHeight: 1.5 }}>{primary.desc}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 17, color: "#3D352A", fontWeight: 500 }}>{money(primary.price)}</span>
                      <span style={{ fontSize: 13, color: "#A89A82", textDecoration: "line-through" }}>{money(primary.mrp)}</span>
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => addToCart(primary)}
                      style={{ marginTop: 12, background: "#3D352A", color: "#F6EFE2", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", padding: "11px 20px", borderRadius: 2 }}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              )}

              {/* runner-up */}
              {runnerUp && (
                <>
                  <p style={{ fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase", color: "#8A7E6C", fontWeight: 500, margin: "24px 0 12px" }}>
                    You might also love
                  </p>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ position: "relative", width: 56, height: 56, borderRadius: 5, overflow: "hidden", background: "#EDE2CC", flexShrink: 0 }}>
                      {runnerUp.img && <Image src={runnerUp.img} alt={runnerUp.name} fill sizes="56px" style={{ objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SERIF, fontSize: 16, color: "#2F2820" }}>{runnerUp.name}</div>
                      <div style={{ fontSize: 13, color: "#3D352A", fontWeight: 500, marginTop: 2 }}>{money(runnerUp.price)}</div>
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => addToCart(runnerUp)}
                      style={{ flexShrink: 0, background: "#3D352A", color: "#F6EFE2", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 11, letterSpacing: "1.2px", textTransform: "uppercase", padding: "10px 16px", borderRadius: 2 }}
                    >
                      Add
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={reset}
                style={{ marginTop: 26, width: "100%", background: "none", border: "1px solid #C8A87C", color: "#3D352A", cursor: "pointer", fontFamily: SANS, fontSize: 12.5, letterSpacing: "1.5px", textTransform: "uppercase", padding: 13, borderRadius: 2 }}
              >
                Retake quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
