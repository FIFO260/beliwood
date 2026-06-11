"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, setupGsap, prefersReducedMotion } from "@/components/fx/gsap";
import PageHeader from "@/components/PageHeader";
import type { PortfolioItem } from "@/lib/portfolio";

interface KolekciaT {
  badge: string;
  title: string;
  sub: string;
  madeFrom: string;
}

export default function KolekciaClient({ items, t }: { items: PortfolioItem[]; t: KolekciaT }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      const cards = gridRef.current?.querySelectorAll<HTMLElement>(".portfolio-card");
      cards?.forEach((card) => {
        gsap.from(card, {
          y: 70,
          autoAlpha: 0,
          duration: 1,
          ease: "beli",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          },
        });
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  const featured = items.find((i) => i.featured);
  const rest = items.filter((i) => !i.featured);

  return (
    <div className="bg-[#0D1321] min-h-screen">
      <PageHeader badge={t.badge} title={t.title} sub={t.sub} />

      {/* Portfolio grid */}
      <div ref={gridRef} className="px-8 md:px-16 lg:px-24 pb-24 space-y-6">
        {/* Featured item — full width */}
        {featured && (
          <div className="portfolio-card card-shine group relative overflow-hidden" style={{ height: "clamp(360px, 55vw, 700px)" }}>
            <Image
              src={featured.img}
              alt={featured.name}
              fill
              className="scale-110 object-cover transition-transform duration-700 group-hover:scale-[1.15]"
              sizes="100vw"
              priority
              data-speed="auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321] via-[#0D1321]/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#C5D86D] text-[#0D1321] text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1">
                  {featured.woodSpecies}
                </span>
                <span className="text-[#FFEDDF]/40 text-xs tracking-widest uppercase">
                  {t.madeFrom}
                </span>
              </div>
              <p className="text-[#FFEDDF]/50 text-sm uppercase tracking-widest mb-2">
                {featured.category} · {featured.year}
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-[#FFEDDF] leading-tight mb-4">
                {featured.name}
              </h2>
              <p className="text-[#FFEDDF]/60 text-sm md:text-base max-w-2xl leading-relaxed">
                {featured.description}
              </p>
            </div>
          </div>
        )}

        {/* Remaining items — 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rest.map((item) => (
            <div
              key={item.id}
              className="portfolio-card card-shine group relative overflow-hidden"
              style={{ height: "clamp(280px, 35vw, 520px)" }}
            >
              <Image
                src={item.img}
                alt={item.name}
                fill
                className="scale-110 object-cover transition-transform duration-700 group-hover:scale-[1.15]"
                sizes="50vw"
                data-speed="auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/95 via-[#0D1321]/20 to-transparent" />
              <div className="absolute inset-0 border border-[#C5D86D]/0 group-hover:border-[#C5D86D]/20 transition-all duration-500" />

              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#C5D86D] text-[#0D1321] text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5">
                    {item.woodSpecies}
                  </span>
                  <span className="text-[#FFEDDF]/40 text-[10px] tracking-widest uppercase">
                    {t.madeFrom}
                  </span>
                </div>
                <p className="text-[#FFEDDF]/40 text-xs tracking-widest uppercase mb-1">
                  {item.category} · {item.year}
                </p>
                <h3 className="font-display text-xl md:text-2xl font-bold text-[#FFEDDF] leading-tight mb-2">
                  {item.name}
                </h3>
                <p className="text-[#FFEDDF]/50 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
