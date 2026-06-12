"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { gsap, setupGsap } from "@/components/fx/gsap";
import type { Product } from "@/lib/products";
import { useLang } from "@/lib/useLang";

export interface CardLabels {
  categories?: Record<string, string>;
  view?: string;
}

interface Props {
  product: Product;
  addToCartLabel?: string;
  labels?: CardLabels;
}

export default function ProductCard({ product, addToCartLabel, labels }: Props) {
  const { addItem, openCart } = useCartStore();
  const lang = useLang();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setupGsap();
    // hmatová odozva tlačidla
    gsap.fromTo(
      btnRef.current,
      { scale: 0.88 },
      { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.45)" },
    );
    addItem(product);
    openCart();
  };

  return (
    <Link
      href={`/${lang}/products/${product.id}`}
      className="group block"
      data-cursor="view"
      data-cursor-label={labels?.view ?? "Detail"}
    >
      <div className="overflow-hidden bg-[#FFEDDF]">
        <div className="product-img-reveal card-shine relative aspect-[4/3] overflow-hidden bg-[#86615C]/10">
          {product.img && (
            <Image
              src={product.img}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute inset-0 bg-[#0D1321]/0 transition-colors duration-300 group-hover:bg-[#0D1321]/10" />
          <span className="absolute left-3 top-3 bg-[#0D1321]/70 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-[#C5D86D] backdrop-blur-sm">
            {labels?.categories?.[product.category] ?? product.category}
          </span>
        </div>

        <div className="p-5">
          <h3 className="mb-1 font-display text-lg font-semibold text-[#0D1321] transition-colors group-hover:text-[#86615C]">
            {product.name}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-[#86615C]">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-bold text-[#0D1321]">
              {product.price} €
            </span>
            <button
              ref={btnRef}
              onClick={handleAdd}
              className="btn-sweep bg-[#0D1321] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#FFEDDF] [--btn-sweep-bg:#C5D86D] hover:text-[#0D1321]"
            >
              <span>{addToCartLabel ?? "Do košíka"}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
