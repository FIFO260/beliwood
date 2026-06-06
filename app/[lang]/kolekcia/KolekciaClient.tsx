"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PortfolioItem } from "@/lib/portfolio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface KolekciaT {
  badge: string;
  title: string;
  sub: string;
  madeFrom: string;
}

export default function KolekciaClient({ items, t }: { items: PortfolioItem[]; t: KolekciaT }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current?.children ?? [], {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });

      const cards = gridRef.current?.querySelectorAll<HTMLElement>(".portfolio-card");
      if (cards) {
        cards.forEach((card) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          });
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const featured = items.find((i) => i.featured);
  const rest = items.filter((i) => !i.featured);

  return (
    <div className="bg-[#0D1321] min-h-screen">
      {/* Header */}
      <div className="pt-32 pb-16 px-8 md:px-16 lg:px-24">
        <div ref={headerRef}>
          <p className="text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            {t.badge}
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-[#FFEDDF] mb-6 leading-tight">
            {t.title}
          </h1>
          <p className="text-[#FFEDDF]/50 text-lg max-w-xl">
            {t.sub}
          </p>
        </div>
      </div>

      {/* Portfolio grid */}
      <div ref={gridRef} className="px-8 md:px-16 lg:px-24 pb-24 space-y-6">
        {/* Featured item — full width */}
        {featured && (
          <div className="portfolio-card group relative overflow-hidden" style={{ height: "clamp(360px, 55vw, 700px)" }}>
            <Image
              src={featured.img}
              alt={featured.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="100vw"
              priority
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
              className="portfolio-card group relative overflow-hidden"
              style={{ height: "clamp(280px, 35vw, 520px)" }}
            >
              <Image
                src={item.img}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="50vw"
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
