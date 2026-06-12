"use client";

import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import PageHeader from "@/components/PageHeader";
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
  labels,
  lang,
}: {
  products: Product[];
  t: ProductsT;
  labels: { categories: Record<string, string>; view: string };
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
      <PageHeader badge={t.badge} title={t.title} sub={t.sub} />

      <div className="border-b border-[#86615C]/20 bg-[#FFEDDF]">
        <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto py-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActive(cat.value)}
              className={`flex-shrink-0 px-5 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${
                active === cat.value
                  ? "bg-[#0D1321] text-[#FFEDDF]"
                  : "bg-white border border-[#86615C]/30 text-[#86615C] hover:border-[#0D1321] hover:text-[#0D1321]"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto flex-shrink-0 self-center font-mono text-xs text-[#86615C]">
            {filtered.length} {countLabel(filtered.length)}
          </span>
        </div>
      </div>

      <ProductGrid products={filtered} addToCartLabel={t.addToCart} labels={labels} />
    </>
  );
}
