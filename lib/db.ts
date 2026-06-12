import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { put, list } from "@vercel/blob";
import type { Product } from "./products";
import type { WoodProduct } from "./wood";

/** Po zmene dát prestav statické stránky, nech verejný web ukáže nový produkt. */
function revalidatePublic() {
  try {
    revalidatePath("/", "layout");
  } catch {
    // mimo request scope (build) — nevadí
  }
}

const DATA_DIR = path.join(process.cwd(), "data");

// Na Verceli je súborový systém read-only / efemérny — JSON dáta
// musia žiť vo Vercel Blob. Lokálne sa ďalej používa priečinok data/.
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

// URL blobu sa po prvom čítaní/zápise cachuje (list() je pomalší)
const blobUrlCache = new Map<string, string>();

async function readJson<T>(filename: string, fallback: () => Promise<T>): Promise<T> {
  if (useBlob) {
    try {
      let url = blobUrlCache.get(filename);
      if (!url) {
        const { blobs } = await list({ prefix: `data/${filename}` });
        const hit = blobs.find((b) => b.pathname === `data/${filename}`);
        if (!hit) return fallback();
        url = hit.url;
        blobUrlCache.set(filename, url);
      }
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Blob fetch ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      console.error(`readJson(${filename}) blob failed:`, e);
      return fallback();
    }
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

async function writeJson(filename: string, data: unknown): Promise<void> {
  if (useBlob) {
    const blob = await put(`data/${filename}`, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    blobUrlCache.set(filename, blob.url);
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

export async function getProducts(): Promise<Product[]> {
  return readJson<Product[]>("products.json", async () => {
    const { products } = await import("./products");
    return products;
  });
}

export async function saveProducts(products: Product[]): Promise<void> {
  await writeJson("products.json", products);
  revalidatePublic();
}

export async function getWoodProducts(): Promise<WoodProduct[]> {
  return readJson<WoodProduct[]>("wood.json", async () => {
    const { woodProducts } = await import("./wood");
    return woodProducts;
  });
}

export async function saveWoodProducts(products: WoodProduct[]): Promise<void> {
  await writeJson("wood.json", products);
  revalidatePublic();
}
