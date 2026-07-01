"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================================
   ChatAssistant — a floating shopping assistant, bottom-right on every route.
   Talks to /api/chat, which proxies to Groq. Purely conversational; the API
   key never touches the client.
   ============================================================================ */

const SERIF = "var(--font-display), Georgia, serif";
const SANS = "var(--font-body), -apple-system, sans-serif";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Hi! I'm your Lumière guide ✦ Tell me what you're looking for — calm, focus, better sleep, a gift — and I'll suggest the perfect piece.",
};

const SUGGESTIONS = ["Help me pick a gift", "Something for better sleep", "What's good for anxiety?"];

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // keep the latest message in view
  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send only the real conversation (skip the local greeting)
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      const reply = res.ok
        ? data.reply
        : data.error || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't reach the network — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* panel */}
      <div
        role="dialog"
        aria-label="Shopping assistant"
        style={{
          position: "fixed",
          right: 24,
          bottom: 96,
          zIndex: 55,
          width: 370,
          maxWidth: "calc(100vw - 32px)",
          height: 520,
          maxHeight: "calc(100vh - 140px)",
          display: "flex",
          flexDirection: "column",
          background: "#F6EFE2",
          border: "1px solid #E3D6BD",
          borderRadius: 14,
          boxShadow: "0 30px 70px rgba(47,40,32,0.28)",
          transformOrigin: "bottom right",
          transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.24s ease, transform 0.24s cubic-bezier(0.2,0.7,0.2,1)",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div style={{ background: "radial-gradient(600px 200px at 20% 0%, #4A4030 0%, #2F2820 70%)", color: "#F6EFE2", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 999, background: "linear-gradient(135deg, #C8A87C, #E4C188)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#2F2820", fontSize: 16 }}>✦</span>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1 }}>Lumière Assistant</div>
              <div style={{ fontSize: 11.5, color: "#C7B998", marginTop: 3 }}>Here to help you choose</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close assistant" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#C7B998", lineHeight: 1 }}>×</button>
        </div>

        {/* messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "84%",
                background: m.role === "user" ? "#3D352A" : "#FBF6EC",
                color: m.role === "user" ? "#F6EFE2" : "#3D352A",
                border: m.role === "user" ? "none" : "1px solid #EADFC9",
                borderRadius: 12,
                borderBottomRightRadius: m.role === "user" ? 3 : 12,
                borderBottomLeftRadius: m.role === "user" ? 12 : 3,
                padding: "10px 13px",
                fontSize: 14,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", background: "#FBF6EC", border: "1px solid #EADFC9", borderRadius: 12, borderBottomLeftRadius: 3, padding: "12px 14px" }}>
              <span className="chat-typing" style={{ display: "inline-flex", gap: 4 }}>
                <span style={dot} /><span style={{ ...dot, animationDelay: "0.15s" }} /><span style={{ ...dot, animationDelay: "0.3s" }} />
              </span>
            </div>
          )}

          {/* quick suggestions (only before the user has said anything) */}
          {messages.length === 1 && !loading && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{ background: "none", border: "1px solid #C8A87C", color: "#6A5F4F", cursor: "pointer", fontFamily: SANS, fontSize: 12.5, borderRadius: 999, padding: "7px 12px" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #E3D6BD" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products…"
            className="field-input"
            style={{ flex: 1, background: "#FBF6EC", border: "1px solid #E0D2B6", borderRadius: 999, padding: "11px 16px", fontFamily: SANS, fontSize: 14, color: "#3D352A", outline: "none" }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 999, background: "#3D352A", color: "#F6EFE2", border: "none", cursor: loading || !input.trim() ? "default" : "pointer", opacity: loading || !input.trim() ? 0.55 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      {/* launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open shopping assistant"}
        aria-expanded={open}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 55,
          width: 58,
          height: 58,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: "radial-gradient(120px 60px at 30% 20%, #4A4030 0%, #2F2820 80%)",
          color: "#F6EFE2",
          boxShadow: "0 14px 34px rgba(47,40,32,0.4)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6a8.5 8.5 0 0 1-.9-3.9A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
          </svg>
        )}
      </button>
    </>
  );
}

const dot: React.CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  background: "#B5894F",
  display: "inline-block",
  animation: "chatDot 1s infinite ease-in-out",
};
