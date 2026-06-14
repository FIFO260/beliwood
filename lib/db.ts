import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { put, list } from "@vercel/blob";
import type { Product } from "./products";
import type { WoodProduct } from "./wood";
import type { PortfolioItem } from "./portfolio";
import type { OrderPayload } from "./orderEmail";

export type OrderStatus = "new" | "confirmed" | "shipped" | "done";

export interface Order extends OrderPayload {
  id: number;
  createdAt: string;
  status: OrderStatus;
}

export interface HomepageSettings {
  featuredWoodIds: number[];
  showcaseProductIds: number[];
  stats: number[];
  about: {
    badge: string;
    title: string;
    p1: string;
    p2: string;
    link: string;
    img: string;
  };
}

const defaultHomepageSettings: HomepageSettings = {
  featuredWoodIds: [],
  showcaseProductIds: [],
  stats: [10, 5, 100, 200],
  about: { badge: "", title: "", p1: "", p2: "", link: "", img: "" },
};

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
// Auth: klasický token, alebo nový OIDC flow (Vercel injektuje BLOB_STORE_ID
// + VERCEL_OIDC_TOKEN a SDK si ich nájde samo)
const useBlob = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

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

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  return readJson<PortfolioItem[]>("portfolio.json", async () => {
    const { portfolioItems } = await import("./portfolio");
    return portfolioItems;
  });
}

export async function savePortfolioItems(items: PortfolioItem[]): Promise<void> {
  await writeJson("portfolio.json", items);
  revalidatePublic();
}

export async function getHomepageSettings(): Promise<HomepageSettings> {
  return readJson<HomepageSettings>("homepage.json", async () => defaultHomepageSettings);
}

export async function saveHomepageSettings(settings: HomepageSettings): Promise<void> {
  await writeJson("homepage.json", settings);
  revalidatePublic();
}

export async function getOrders(): Promise<Order[]> {
  return readJson<Order[]>("orders.json", async () => []);
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await writeJson("orders.json", orders);
}

export async function addOrder(payload: OrderPayload): Promise<Order> {
  const orders = await getOrders();
  const maxId = orders.reduce((m, o) => Math.max(m, o.id), 0);
  const order: Order = {
    ...payload,
    id: maxId + 1,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  await saveOrders([order, ...orders]);
  return order;
}
