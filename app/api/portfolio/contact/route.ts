import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolio_id, sender_name, sender_email, subject, message } = body;

    // Server-side validation
    if (!portfolio_id) return NextResponse.json({ error: "Missing portfolio ID" }, { status: 400 });
    if (!sender_name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!sender_email?.trim() || !isValidEmail(sender_email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    if (!message?.trim() || message.trim().length < 10) return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });

    const supabase = await createClient();

    // Verify the portfolio exists and is public
    const { data: portfolio, error: pErr } = await supabase
      .from("portfolios")
      .select("id, is_public")
      .eq("id", portfolio_id)
      .single();

    if (pErr || !portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    if (!portfolio.is_public) return NextResponse.json({ error: "This portfolio is private" }, { status: 403 });

    // Insert the message
    const { error: insertErr } = await supabase
      .from("portfolio_messages")
      .insert({
        portfolio_id,
        sender_name: sender_name.trim(),
        sender_email: sender_email.trim().toLowerCase(),
        subject: subject?.trim() || null,
        message: message.trim(),
      });

    if (insertErr) {
      console.error("[portfolio/contact] Insert error:", insertErr);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[portfolio/contact]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
