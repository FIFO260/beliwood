import { NextRequest, NextResponse } from "next/server";
import { getWoodProducts, saveWoodProducts } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getWoodProducts());
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await getWoodProducts();
  const body = await req.json();
  const maxId = products.reduce((m, p) => Math.max(m, p.id), 100);
  const newProduct = { ...body, id: maxId + 1 };
  await saveWoodProducts([...products, newProduct]);
  return NextResponse.json(newProduct, { status: 201 });
}
