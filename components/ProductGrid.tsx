"use client";

import { useEffect, useRef } from "react";
import { gsap, setupGsap, prefersReducedMotion } from "@/components/fx/gsap";
import { wireReveals } from "@/components/fx/reveal";
import ProductCard, { type CardLabels } from "./ProductCard";
import type { Product } from "@/lib/products";

interface Props {
  products: Product[];
  title?: string;
  subtitle?: string;
  addToCartLabel?: string;
  labels?: CardLabels;
}

export default function ProductGrid({ products, title, subtitle, addToCartLabel, labels }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      wireReveals(sectionRef.current!);
      if (prefersReducedMotion()) return;

      const cards = gridRef.current?.querySelectorAll<HTMLElement>(".product-card");
      if (cards?.length) {
        gsap.from(cards, {
          y: 80,
          autoAlpha: 0,
          duration: 1,
          ease: "beli",
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", once: true },
        });
      }
      const images = gridRef.current?.querySelectorAll<HTMLElement>(".product-img-reveal");
      if (images?.length) {
        gsap.from(images, {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.2,
          ease: "beli",
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", once: true },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <section ref={sectionRef} className="bg-[#FFEDDF] px-6 py-28">
      <div className="mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-16">
            {title && (
              <h2
                className="mb-4 font-display text-4xl font-bold text-[#0D1321] md:text-6xl"
                data-reveal="lines"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="max-w-xl text-lg text-[#86615C]" data-reveal="fade" data-delay="0.15">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div ref={gridRef} className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <ProductCard product={p} addToCartLabel={addToCartLabel} labels={labels} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
