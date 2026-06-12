import { NextRequest, NextResponse } from "next/server";
import { getPortfolioItems, savePortfolioItems } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const numId = parseInt(id);
  const items = await getPortfolioItems();
  const idx = items.findIndex((p) => p.id === numId);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const update = await req.json();
  items[idx] = { ...items[idx], ...update, id: numId };
  await savePortfolioItems(items);
  return NextResponse.json(items[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const items = await getPortfolioItems();
  const filtered = items.filter((p) => p.id !== parseInt(id));
  if (filtered.length === items.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await savePortfolioItems(filtered);
  return NextResponse.json({ ok: true });
}
