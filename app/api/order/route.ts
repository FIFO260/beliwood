import { NextRequest, NextResponse } from "next/server";
import { adminEmail, customerEmail, type OrderPayload, type OrderItem } from "@/lib/orderEmail";
import { addOrder } from "@/lib/db";

export const dynamic = "force-dynamic";

const isEmail = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : null;

function validateItems(raw: unknown): OrderItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) return null;
  const items: OrderItem[] = [];
  for (const it of raw) {
    if (!it || typeof it !== "object") return null;
    const { product, quantity } = it as Record<string, unknown>;
    if (!product || typeof product !== "object") return null;
    const { name, price, sku, img } = product as Record<string, unknown>;
    if (typeof name !== "string" || name.length > 200) return null;
    if (typeof price !== "number" || price < 0 || price > 1_000_000) return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) return null;
    items.push({
      quantity,
      product: {
        name: name.trim(),
        price,
        sku: typeof sku === "string" ? sku.slice(0, 50) : undefined,
        img: typeof img === "string" ? img.slice(0, 500) : undefined,
      },
    });
  }
  return items;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<OrderPayload>;
    const { email, items: rawItems } = body;

    // Validate and sanitize each field — never trust client values
    const name = str(body.name, 100);
    const street = str(body.street, 200);
    const city = str(body.city, 100);
    const zip = str(body.zip, 20);
    const phone = typeof body.phone === "string" ? body.phone.slice(0, 30) : undefined;
    const note = typeof body.note === "string" ? body.note.slice(0, 1000) : undefined;

    if (!name || !isEmail(email) || !street || !city || !zip) {
      return NextResponse.json({ error: "Chýbajú povinné údaje" }, { status: 400 });
    }

    const items = validateItems(rawItems);
    if (!items) {
      return NextResponse.json({ error: "Košík je prázdny alebo obsahuje neplatné položky" }, { status: 400 });
    }

    // Recalculate total server-side — never trust the client-sent total
    const total = Math.round(items.reduce((s, it) => s + it.product.price * it.quantity, 0) * 100) / 100;

    const order: OrderPayload = { name, email: email as string, phone, street, city, zip, note, items, total };

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
