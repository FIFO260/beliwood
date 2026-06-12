import { NextRequest, NextResponse } from "next/server";
import { getHomepageSettings, saveHomepageSettings } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getHomepageSettings());
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  await saveHomepageSettings(body);
  return NextResponse.json(body);
}
