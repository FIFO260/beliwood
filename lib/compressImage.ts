/**
 * Zmenší a skomprimuje fotku v prehliadači ešte pred uploadom.
 * Mobilné fotky majú bežne 5–15 MB — po zmenšení na max 1600 px
 * a JPEG ~0.82 z nich ostane ~200–400 kB, takže upload prejde aj
 * cez pomalé mobilné pripojenie a limit servera (4,5 MB na Verceli).
 */
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82,
): Promise<File> {
  // GIF/SVG nechaj tak — canvas by zabil animáciu/vektor
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // formát, ktorý prehliadač nevie dekódovať — pošli originál
    return file;
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  // malý súbor, ktorý netreba zmenšovať
  if (scale === 1 && file.size < 500_000) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return file;

  // keby kompresia paradoxne nepomohla, pošli menší z dvojice
  if (blob.size >= file.size) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

/** Upload cez XHR kvôli progresu — fetch upload progres nevie. */
export function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
  timeoutMs = 60_000,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.timeout = timeoutMs;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Neplatná odpoveď servera"));
        }
      } else {
        let msg = `Upload zlyhal (${xhr.status})`;
        try {
          msg = JSON.parse(xhr.responseText).error ?? msg;
        } catch {
          /* ponechaj všeobecnú hlášku */
        }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Sieťová chyba — skontrolujte pripojenie"));
    xhr.ontimeout = () => reject(new Error("Upload vypršal — skúste menší obrázok"));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}
