import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, street, city, zip, note, items, total } = body;
    const resendKey = process.env.RESEND_API_KEY;
    const orderEmail = process.env.ORDER_EMAIL ?? "info@beliwood.sk";
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "BeliWood <onboarding@resend.dev>",
        to: orderEmail,
        replyTo: email,
        subject: "Nova objednavka od " + name,
        text: "Objednavka od: " + name + ", Email: " + email + ", Celkom: " + total + " EUR",
      });
    } else {
      console.log("[DEV] No RESEND_API_KEY. Order from:", name, email);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Odoslanie zlyhalo" }, { status: 500 });
  }
}
