"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/lib/products";
import { useLang } from "@/lib/useLang";

interface Props {
  product: Product;
  addToCartLabel?: string;
}

export default function ProductCard({ product, addToCartLabel }: Props) {
  const { addItem, openCart } = useCartStore();
  const lang = useLang();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    openCart();
  };

  return (
    <Link href={`/${lang}/products/${product.id}`} className="group block">
      <div className="bg-[#FFEDDF] overflow-hidden">
        {/* Image */}
        <div className="product-img-reveal relative aspect-[4/3] overflow-hidden bg-[#86615C]/10">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-[#0D1321]/0 group-hover:bg-[#0D1321]/10 transition-colors duration-300" />
          {/* Category badge */}
          <span className="absolute top-3 left-3 bg-[#0D1321]/70 text-[#C5D86D] text-xs font-medium px-2.5 py-1 tracking-wide uppercase">
            {product.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-[#0D1321] mb-1 group-hover:text-[#86615C] transition-colors">
            {product.name}
          </h3>
          <p className="text-[#86615C] text-sm mb-4 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-bold text-[#0D1321]">
              {product.price} €
            </span>
            <button
              onClick={handleAdd}
              className="bg-[#0D1321] text-[#FFEDDF] text-xs font-semibold px-4 py-2.5 hover:bg-[#C5D86D] hover:text-[#0D1321] transition-colors tracking-wide uppercase"
            >
              {addToCartLabel ?? "Do košíka"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
