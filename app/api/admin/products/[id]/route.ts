import { NextRequest, NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/admin/products/[id]">) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const numId = parseInt(id);
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === numId);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const update = await req.json();
  products[idx] = { ...products[idx], ...update, id: numId };
  await saveProducts(products);
  return NextResponse.json(products[idx]);
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/products/[id]">) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== parseInt(id));
  if (filtered.length === products.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveProducts(filtered);
  return NextResponse.json({ ok: true });
}
