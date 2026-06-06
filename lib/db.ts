import fs from "fs/promises";
import path from "path";
import type { Product } from "./products";
import type { WoodProduct } from "./wood";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const WOOD_FILE = path.join(DATA_DIR, "wood.json");

export async function getProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, "utf8");
    return JSON.parse(raw) as Product[];
  } catch {
    const { products } = await import("./products");
    return products;
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

export async function getWoodProducts(): Promise<WoodProduct[]> {
  try {
    const raw = await fs.readFile(WOOD_FILE, "utf8");
    return JSON.parse(raw) as WoodProduct[];
  } catch {
    const { woodProducts } = await import("./wood");
    return woodProducts;
  }
}

export async function saveWoodProducts(products: WoodProduct[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(WOOD_FILE, JSON.stringify(products, null, 2));
}
