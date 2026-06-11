"use client";

import { useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { gsap, setupGsap, prefersReducedMotion } from "@/components/fx/gsap";
import type { Product } from "@/lib/products";
import { useCartStore } from "@/store/cartStore";

interface DetailT {
  home: string;
  products: string;
  material: string;
  dimensions: string;
  production: string;
  productionValue: string;
  addToCart: string;
  orderNow: string;
  delivery: string;
  related: string;
}

export default function ProductDetailClient({
  product,
  related,
  t,
  lang,
}: {
  product: Product | null;
  related: Product[];
  t: DetailT;
  lang: string;
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from(imgRef.current, {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.2,
        ease: "beli",
      });
      gsap.from(imgRef.current!.querySelector("img"), {
        scale: 1.25,
        duration: 1.6,
        ease: "beli",
      });
      gsap.from(infoRef.current!.children, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: "beli-out",
        stagger: 0.09,
        delay: 0.15,
      });
    });
    return () => ctx.revert();
  }, [product?.id]);

  if (!product) notFound();

  const handleAdd = () => {
    addItem(product);
    openCart();
  };

  return (
    <div className="min-h-screen bg-[#FFEDDF] pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-[#86615C] mb-10">
          <Link href={`/${lang}/`} className="hover:text-[#0D1321] transition-colors">
            {t.home}
          </Link>
          <span>/</span>
          <Link
            href={`/${lang}/products`}
            className="hover:text-[#0D1321] transition-colors"
          >
            {t.products}
          </Link>
          <span>/</span>
          <span className="text-[#0D1321] font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div
            ref={imgRef}
            className="card-shine relative aspect-square overflow-hidden bg-[#86615C]/10"
          >
            <Image
              src={product.img}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <span className="absolute top-4 left-4 bg-[#0D1321]/80 text-[#C5D86D] text-xs font-medium px-3 py-1.5 tracking-widest uppercase">
              {product.category}
            </span>
          </div>

          <div ref={infoRef} className="py-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0D1321] mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="font-display text-4xl font-bold text-[#0D1321] mb-8">
              {product.price}{" "}
              <span className="text-2xl font-normal text-[#86615C]">€</span>
            </p>

            <p className="text-[#86615C] text-base leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="border-t border-[#86615C]/20 pt-8 mb-10 space-y-4">
              <div className="flex justify-between py-3 border-b border-[#86615C]/10">
                <span className="text-xs font-semibold text-[#86615C] tracking-widest uppercase">
                  {t.material}
                </span>
                <span className="text-sm text-[#0D1321] font-medium">
                  {product.material}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#86615C]/10">
                <span className="text-xs font-semibold text-[#86615C] tracking-widest uppercase">
                  {t.dimensions}
                </span>
                <span className="text-sm text-[#0D1321] font-medium">
                  {product.dimensions}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#86615C]/10">
                <span className="text-xs font-semibold text-[#86615C] tracking-widest uppercase">
                  {t.production}
                </span>
                <span className="text-sm text-[#0D1321] font-medium">
                  {t.productionValue}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAdd}
                className="btn-sweep flex-1 bg-[#0D1321] py-4 text-center text-sm font-semibold tracking-wide text-[#FFEDDF] [--btn-sweep-bg:#C5D86D] hover:text-[#0D1321]"
              >
                <span>{t.addToCart}</span>
              </button>
              <Link
                href={`/${lang}/checkout`}
                onClick={handleAdd}
                className="flex-1 border-2 border-[#0D1321] text-[#0D1321] py-4 font-semibold text-sm tracking-wide text-center hover:bg-[#0D1321] hover:text-[#FFEDDF] transition-colors"
              >
                {t.orderNow}
              </Link>
            </div>

            <p className="text-[#86615C] text-xs mt-5 text-center">
              {t.delivery}
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-3xl font-bold text-[#0D1321] mb-10">
              {t.related}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/${lang}/products/${p.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden mb-4">
                    <Image
                      src={p.img}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <p className="font-display font-semibold text-[#0D1321] group-hover:text-[#86615C] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[#86615C] text-sm mt-1">{p.price} €</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
