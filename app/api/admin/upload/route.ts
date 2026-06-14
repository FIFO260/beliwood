import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/adminAuth";

const MAX_SIZE = 8 * 1024 * 1024; // klient komprimuje na ~300 kB, toto je poistka
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

// Validate actual file bytes — file.type comes from the client and can be spoofed.
function detectMimeFromBytes(buf: Uint8Array): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  // GIF: 47 49 46 38 (GIF8)
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  // WebP: RIFF????WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  // AVIF / HEIC: ftyp box at offset 4 with brand "avif" or "avis"
  if (
    buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 &&
    ((buf[8] === 0x61 && buf[9] === 0x76 && buf[10] === 0x69) /* avi */)
  ) return "image/avif";
  return null;
}

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
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `Obrázok je príliš veľký (${(file.size / 1024 / 1024).toFixed(1)} MB, max 8 MB)` },
      { status: 413 },
    );
  }

  // Read bytes and validate magic bytes — don't trust file.type from client
  const arrayBuf = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);
  const detectedMime = detectMimeFromBytes(bytes);
  if (!detectedMime || !ALLOWED.has(detectedMime)) {
    return NextResponse.json(
      { error: `Nepodporovaný formát — použite JPG, PNG, WebP, AVIF alebo GIF` },
      { status: 415 },
    );
  }

  // Use detected MIME (not client-provided) for storage
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const ext = mimeToExt[detectedMime] ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    if (useBlob) {
      const blob = await put(`uploads/${filename}`, new Blob([bytes], { type: detectedMime }), {
        access: "public",
        contentType: detectedMime,
      });
      return NextResponse.json({ url: blob.url });
    }

    // lokálny vývoj — public/uploads
    const buffer = Buffer.from(arrayBuf);
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
