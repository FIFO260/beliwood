import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/adminAuth";

const MAX_SIZE = 8 * 1024 * 1024; // klient komprimuje na ~300 kB, toto je poistka
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

// na Verceli je lokálny disk read-only — obrázky musia ísť do Blob storage
// (klasický token alebo nový OIDC flow cez BLOB_STORE_ID)
const useBlob = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Súbor sa nepodarilo prijať — skúste menší obrázok" },
      { status: 400 },
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Žiadny súbor" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `Nepodporovaný formát (${file.type || "neznámy"}) — použite JPG, PNG alebo WebP` },
      { status: 415 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `Obrázok je príliš veľký (${(file.size / 1024 / 1024).toFixed(1)} MB, max 8 MB)` },
      { status: 413 },
    );
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    if (useBlob) {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    }

    // lokálny vývoj — public/uploads
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e) {
    console.error("Upload failed:", e);
    return NextResponse.json(
      { error: "Uloženie obrázka zlyhalo — skúste to znova" },
      { status: 500 },
    );
  }
}
