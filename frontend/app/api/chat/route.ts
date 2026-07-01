import { NextResponse } from "next/server";
import { CATALOG, money } from "../../_components/catalog";

/* ============================================================================
   Shopping-assistant chat endpoint. Proxies the conversation to Groq's
   OpenAI-compatible chat completions API so the API key stays server-side.
   Set GROQ_API_KEY (and optionally GROQ_MODEL) in .env.local.
   ============================================================================ */

export const runtime = "nodejs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

type ChatMessage = { role: "user" | "assistant"; content: string };

function systemPrompt() {
  const catalog = CATALOG.map(
    (p) => `- ${p.name} (id: ${p.id}) — ${p.desc} Price ${money(p.price)} (was ${money(p.mrp)}).`
  ).join("\n");

  return [
    "You are Lumière's warm, concise shopping assistant for a spiritual & wellness store",
    "(crystals, candles, incense, and ritual jewellery).",
    "Help visitors choose the right piece, answer product questions, and guide them to checkout.",
    "",
    "Store facts you can share:",
    "- Free shipping on orders over ₹2,499; 7-day no-questions-asked returns.",
    "- Every piece is ethically sourced and cleansed & charged under the full moon.",
    "- There's a quick quiz on the home page (\"Confused on what to buy?\") for personalised matches.",
    "",
    "You may ONLY recommend products from this catalogue (never invent products or prices):",
    catalog,
    "",
    "Guidelines: keep replies short and friendly (2-4 sentences), mention the product name and price",
    "when recommending, suggest at most 2 products at a time, and gently steer off-topic chats back to shopping.",
  ].join("\n");
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet — add GROQ_API_KEY to .env.local and restart the server." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown })?.messages;
  const history: ChatMessage[] = Array.isArray(rawMessages)
    ? rawMessages
        .filter(
          (m): m is ChatMessage =>
            !!m &&
            typeof m === "object" &&
            ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
            typeof (m as ChatMessage).content === "string"
        )
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    : [];

  if (history.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.6,
        max_tokens: 500,
        messages: [{ role: "system", content: systemPrompt() }, ...history],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Groq API error", res.status, detail);
      return NextResponse.json(
        { error: "The assistant is having trouble right now. Please try again in a moment." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply: string = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I didn't catch that — could you rephrase?";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error", err);
    return NextResponse.json({ error: "Couldn't reach the assistant. Check your connection and try again." }, { status: 502 });
  }
}
