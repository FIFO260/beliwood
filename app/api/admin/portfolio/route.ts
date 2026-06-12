import { NextRequest, NextResponse } from "next/server";
import { getPortfolioItems, savePortfolioItems } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getPortfolioItems());
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getPortfolioItems();
  const body = await req.json();
  const maxId = items.reduce((m, p) => Math.max(m, p.id), 0);
  const newItem = { ...body, id: maxId + 1 };
  await savePortfolioItems([...items, newItem]);
  return NextResponse.json(newItem, { status: 201 });
}
