import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    await createSession({ id: String(user._id), email: user.email, name: user.name });
    return NextResponse.json({ user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { error: "Could not sign you in. Is MongoDB running?" },
      { status: 500 }
    );
  }
}
