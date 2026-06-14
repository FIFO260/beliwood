import { NextRequest, NextResponse } from "next/server";
import { getOrders, saveOrders } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === parseInt(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  orders[idx] = { ...orders[idx], status };
  await saveOrders(orders);
  return NextResponse.json(orders[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const orders = await getOrders();
  const filtered = orders.filter((o) => o.id !== parseInt(id));
  if (filtered.length === orders.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await saveOrders(filtered);
  return NextResponse.json({ ok: true });
}
