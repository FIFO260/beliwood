export type WoodSpecies = "Dub" | "Buk" | "Čerešňa" | "Orech" | "Orech americký" | "Dub bahenný" | "Suar" | "Oliva";
export type WoodSurface = "Bez povrchovej úpravy" | "Zrovnané na CNC";
export type WoodState = "Čerstvé" | "Vzduchosuché" | "Sušené v sušičke";
export type WoodCategory =
  | "hodiny"
  | "stoly"
  | "konferencny-stol"
  | "postele"
  | "kniznice"
  | "doska-umyvadlo"
  | "forsty"
  | "monolity"
  | "hranoly"
  | "priecne-rezy"
  | "korene"
  | "atyp";

export type ThicknessRange = "10-60" | "60-100" | "100-150";

export interface WoodProduct {
  id: number;
  species: WoodSpecies;
  label: string;
  thickness: number;   // mm
  width: number;       // mm (priemerná šírka)
  length: number;      // mm
  moisture: number;    // %
  state: WoodState;
  surface: WoodSurface;
  category: WoodCategory;
  price: number;       // € / ks
  inStock: boolean;
  naturalEdge: boolean;
  img: string;
  description: string;
}

export function getThicknessRange(t: number): ThicknessRange {
  if (t <= 60) return "10-60";
  if (t <= 100) return "60-100";
  return "100-150";
}

export const woodProducts: WoodProduct[] = [
  {
    id: 101,
    species: "Dub",
    label: "Dubová doska — živá hrana",
    thickness: 50,
    width: 280,
    length: 2400,
    moisture: 8,
    state: "Sušené v sušičke",
    surface: "Bez povrchovej úpravy",
    category: "forsty",
    price: 148,
    inStock: true,
    naturalEdge: true,
    img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80",
    description: "Masívna dubová doska s prírodnou živou hranou. Komorovo sušená, stabilizovaná, ideálna pre stolové dosky a police.",
  },
  {
    id: 102,
    species: "Dub",
    label: "Dubový monolit XXL — živá hrana",
    thickness: 80,
    width: 650,
    length: 3200,
    moisture: 10,
    state: "Vzduchosuché",
    surface: "Zrovnané na CNC",
    category: "monolity",
    price: 620,
    inStock: true,
    naturalEdge: true,
    img: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=800&q=80",
    description: "Výnimočný dubový monolit s prírodnou živou hranou. Vzduchosuché, vhodné na reprezentačné jedálenské stoly.",
  },
  {
    id: 103,
    species: "Orech",
    label: "Orechová doska — živá hrana",
    thickness: 38,
    width: 220,
    length: 2000,
    moisture: 7,
    state: "Sušené v sušičke",
    surface: "Zrovnané na CNC",
    category: "forsty",
    price: 210,
    inStock: true,
    naturalEdge: true,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    description: "Prémiová orechová doska s výraznou kresbou dreva. Zrovnaná na CNC, pripravená na povrchovú úpravu.",
  },
  {
    id: 104,
    species: "Buk",
    label: "Bukový hranol",
    thickness: 75,
    width: 75,
    length: 3000,
    moisture: 22,
    state: "Čerstvé",
    surface: "Bez povrchovej úpravy",
    category: "hranoly",
    price: 38,
    inStock: true,
    naturalEdge: false,
    img: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80",
    description: "Čerstvo rezaný bukový hranol priamo z pily. Vhodný na sušenie a ďalšie spracovanie.",
  },
  {
    id: 105,
    species: "Orech americký",
    label: "Orech americký — doska CNC",
    thickness: 52,
    width: 300,
    length: 2500,
    moisture: 8,
    state: "Sušené v sušičke",
    surface: "Zrovnané na CNC",
    category: "stoly",
    price: 285,
    inStock: true,
    naturalEdge: false,
    img: "https://images.unsplash.com/photo-1609862212026-cf27f0da3bb6?w=800&q=80",
    description: "Americký čierny orech, komorovo sušený, zrovnaný na CNC. Výnimočná kresba dreva pre prémiový nábytok.",
  },
  {
    id: 106,
    species: "Čerešňa",
    label: "Čerešňová doska — sušená",
    thickness: 30,
    width: 180,
    length: 1800,
    moisture: 9,
    state: "Vzduchosuché",
    surface: "Bez povrchovej úpravy",
    category: "forsty",
    price: 165,
    inStock: false,
    naturalEdge: false,
    img: "https://images.unsplash.com/photo-1572297794908-f2cc9f72d93c?w=800&q=80",
    description: "Vzducho-sušená čerešňová doska so teplou červenou farbou. Ideálna pre dizajnový nábytok a doplnky.",
  },
  {
    id: 107,
    species: "Dub bahenný",
    label: "Dub bahenný — priečny rez",
    thickness: 60,
    width: 400,
    length: 400,
    moisture: 12,
    state: "Vzduchosuché",
    surface: "Zrovnané na CNC",
    category: "priecne-rezy",
    price: 320,
    inStock: true,
    naturalEdge: true,
    img: "https://images.unsplash.com/photo-1416169607655-0c2b3ce2e1cc?w=800&q=80",
    description: "Vzácny bahenný dub s tmavou farbou a unikátnou kresbou. Priečny rez / koláč, ideálny pre hodiny alebo dekorácie.",
  },
  {
    id: 108,
    species: "Suar",
    label: "Suarová doska — živá hrana",
    thickness: 50,
    width: 420,
    length: 2200,
    moisture: 10,
    state: "Sušené v sušičke",
    surface: "Zrovnané na CNC",
    category: "stoly",
    price: 380,
    inStock: true,
    naturalEdge: true,
    img: "https://images.unsplash.com/photo-1595953836520-f09ffc0a5f96?w=800&q=80",
    description: "Exotická suarová doska s unikátnou prirodzenou kresbou. Ideálna na jedálenské a konferenčné stoly.",
  },
  {
    id: 109,
    species: "Oliva",
    label: "Olivová doska — atyp",
    thickness: 40,
    width: 160,
    length: 1200,
    moisture: 8,
    state: "Sušené v sušičke",
    surface: "Bez povrchovej úpravy",
    category: "atyp",
    price: 195,
    inStock: true,
    naturalEdge: true,
    img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
    description: "Olivové drevo s charakteristickou žilkovanou kresbou a teplou farbou. Unikátny materiál na atypické projekty.",
  },
];

export const allSpecies: WoodSpecies[] = ["Dub", "Buk", "Čerešňa", "Orech", "Orech americký", "Dub bahenný", "Suar", "Oliva"];
export const allSurfaces: WoodSurface[] = ["Bez povrchovej úpravy", "Zrovnané na CNC"];
export const allStates: WoodState[] = ["Čerstvé", "Vzduchosuché", "Sušené v sušičke"];
export const allThicknessRanges: ThicknessRange[] = ["10-60", "60-100", "100-150"];
export const allCategories: WoodCategory[] = [
  "hodiny", "stoly", "konferencny-stol", "postele", "kniznice",
  "doska-umyvadlo", "forsty", "monolity", "hranoly", "priecne-rezy", "korene", "atyp",
];

import type { Product } from "./products";

/** Drevo ako položka košíka (zdieľané kartou aj detailom). */
export function woodToProduct(w: WoodProduct): Product {
  return {
    id: w.id,
    sku: "",
    name: w.label,
    price: w.price,
    category: "doplnky",
    img: w.img,
    description: w.description,
    material: `Masívny ${w.species}`,
    dimensions: `${w.thickness / 10} × ${w.width / 10} × ${w.length / 10} cm`,
  };
}
