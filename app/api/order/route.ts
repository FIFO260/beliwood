import { NextRequest, NextResponse } from "next/server";
import { adminEmail, customerEmail, type OrderPayload } from "@/lib/orderEmail";
import { addOrder } from "@/lib/db";

export const dynamic = "force-dynamic";

const isEmail = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<OrderPayload>;
    const { name, email, street, city, zip, items, total } = body;

    // serverová validácia — klientovi nedôverujeme
    if (!name?.trim() || !isEmail(email) || !street?.trim() || !city?.trim() || !zip?.trim()) {
      return NextResponse.json({ error: "Chýbajú povinné údaje" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Košík je prázdny" }, { status: 400 });
    }

    const order = body as OrderPayload;

    // uložiť objednávku — nezávisí od e-mailov
    await addOrder(order);

    const resendKey = process.env.RESEND_API_KEY;
    const orderEmail = process.env.ORDER_EMAIL ?? "stolybeliwood@gmail.com";
    // from musí byť na overenej doméne v Resend, inak prejde len e-mail
    // majiteľovi účtu. Default = test doména (funguje len obmedzene).
    const from = process.env.ORDER_FROM ?? "BeliWood <onboarding@resend.dev>";

    if (!resendKey || resendKey.startsWith("re_your_")) {
      // bez platného kľúča (lokálny vývoj) objednávku len zalogujeme
      console.log("[DEV] Objednávka (e-maily preskočené):", name, email, total, "€");
      return NextResponse.json({ ok: true, dev: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const admin = adminEmail(order);
    const customer = customerEmail(order);

    // oba e-maily naraz; zlyhanie jedného nezhodí druhý
    const results = await Promise.allSettled([
      resend.emails.send({
        from,
        to: orderEmail,
        replyTo: order.email,
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
      }),
      resend.emails.send({
        from,
        to: order.email,
        replyTo: orderEmail,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
      }),
    ]);

    const [adminRes, customerRes] = results;
    if (adminRes.status === "rejected") console.error("Admin e-mail zlyhal:", adminRes.reason);
    if (customerRes.status === "rejected") console.error("Zákaznícky e-mail zlyhal:", customerRes.reason);
    // Resend môže vrátiť 200 s chybou v tele
    if (adminRes.status === "fulfilled" && adminRes.value.error)
      console.error("Admin e-mail error:", adminRes.value.error);
    if (customerRes.status === "fulfilled" && customerRes.value.error)
      console.error("Zákaznícky e-mail error:", customerRes.value.error);

    // admin notifikácia je kritická — ak zlyhá, objednávka by sa stratila
    const adminOk =
      adminRes.status === "fulfilled" && !adminRes.value.error;
    if (!adminOk) {
      return NextResponse.json({ error: "Objednávku sa nepodarilo odoslať" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Odoslanie zlyhalo" }, { status: 500 });
  }
}
