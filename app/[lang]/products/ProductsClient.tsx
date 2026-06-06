"use client";

import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import type { Product, Category } from "@/lib/products";

interface ProductsT {
  badge: string;
  title: string;
  sub: string;
  all: string;
  catFurniture: string;
  catAccessories: string;
  catKitchen: string;
  count1: string;
  count2: string;
  count5: string;
  addToCart: string;
}

export default function ProductsClient({
  products,
  t,
  lang,
}: {
  products: Product[];
  t: ProductsT;
  lang: string;
}) {
  const categories: { label: string; value: "all" | Category }[] = [
    { label: t.all, value: "all" },
    { label: t.catFurniture, value: "nábytok" },
    { label: t.catAccessories, value: "doplnky" },
    { label: t.catKitchen, value: "kuchyňa" },
  ];

  const [active, setActive] = useState<"all" | Category>("all");

  const filtered =
    active === "all" ? products : products.filter((p) => p.category === active);

  const countLabel = (n: number) => {
    if (n === 1) return t.count1;
    if (n >= 2 && n <= 4) return t.count2;
    return t.count5;
  };

  return (
    <>
      <div className="bg-[#0D1321] pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            {t.badge}
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-[#FFEDDF] mb-6">
            {t.title}
          </h1>
          <p className="text-[#FFEDDF]/50 text-lg max-w-xl">
            {t.sub}
          </p>
        </div>
      </div>

      <div className="bg-[#FFEDDF] border-b border-[#86615C]/20 sticky z-40" style={{ top: "var(--nav-h, 4rem)" }}>
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto py-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`flex-shrink-0 px-5 py-2 text-sm font-medium transition-colors ${
                active === cat.value
                  ? "bg-[#0D1321] text-[#FFEDDF]"
                  : "bg-white border border-[#86615C]/30 text-[#86615C] hover:border-[#0D1321] hover:text-[#0D1321]"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto flex-shrink-0 self-center text-xs text-[#86615C]">
            {filtered.length} {countLabel(filtered.length)}
          </span>
        </div>
      </div>

      <ProductGrid products={filtered} addToCartLabel={t.addToCart} />
    </>
  );
}
