"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Props {
  products: Product[];
  title?: string;
  subtitle?: string;
  addToCartLabel?: string;
}

export default function ProductGrid({ products, title, subtitle, addToCartLabel }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
          },
        });
      }

      // Card entrance: stagger with y + scale
      const cards = gridRef.current?.querySelectorAll<HTMLElement>(".product-card");
      if (cards) {
        gsap.from(cards, {
          y: 70,
          opacity: 0,
          scale: 0.96,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
          },
        });
      }

      // Clip-path image reveal — curtain drops to unveil each image
      const images = gridRef.current?.querySelectorAll<HTMLElement>(".product-img-reveal");
      if (images) {
        gsap.from(images, {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.1,
          stagger: 0.12,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
          },
        });
      }
    }, gridRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <section className="py-24 px-6 bg-[#FFEDDF]">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div ref={headerRef} className="mb-14">
            {title && (
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0D1321] mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[#86615C] text-lg max-w-xl">{subtitle}</p>
            )}
          </div>
        )}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <ProductCard product={p} addToCartLabel={addToCartLabel} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
