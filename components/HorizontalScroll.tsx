"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, setupGsap, ScrollTrigger, prefersReducedMotion } from "@/components/fx/gsap";
import type { Product } from "@/lib/products";

interface HScrollT {
  badge: string;
  title1: string;
  title2: string;
  scroll: string;
  view: string;
  categories: Record<string, string>;
}

function CardContent({ p, i, lang, t }: { p: Product; i: number; lang: string; t: HScrollT }) {
  return (
    <Link
      href={`/${lang}/products/${p.id}`}
      className="h-card card-shine group relative block flex-shrink-0 overflow-hidden"
      style={{
        width: "clamp(240px, 72vw, 520px)",
        height: "clamp(280px, 55vh, 620px)",
      }}
    >
      <div className="h-card-img absolute -inset-x-10 inset-y-0 will-change-transform">
        {p.img && (
          <Image
            src={p.img}
            alt=""
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 767px) 72vw, 42vw"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/90 via-[#0D1321]/20 to-transparent" />
      <span className="absolute right-4 top-4 select-none font-display text-5xl font-bold leading-none text-[#FFEDDF]/10">
        {String(i + 1).padStart(2, "0")}
      </span>
      <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-5 transition-transform duration-300 group-hover:translate-y-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5D86D]">
          {t.categories[p.category] ?? p.category}
        </span>
        <h3 className="mt-1 font-display text-lg font-bold leading-tight text-[#FFEDDF] md:text-2xl">
          {p.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-[#FFEDDF]">{p.price} €</span>
          <span className="text-xs font-medium tracking-wider text-[#C5D86D] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {t.view} →
          </span>
        </div>
      </div>
      <div className="absolute inset-0 border border-[#C5D86D]/0 transition-all duration-500 group-hover:border-[#C5D86D]/30" />
    </Link>
  );
}

export default function HorizontalScroll({ products, t, lang }: { products: Product[]; t: HScrollT; lang: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;
    setupGsap();

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const section = sectionRef.current!;
      const calc = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const images = gsap.utils.toArray<HTMLElement>(".h-card-img", track);
      const cards = gsap.utils.toArray<HTMLElement>(".h-card", track);
      const skewTo = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power2.out" });
      const progressSet = progressRef.current
        ? gsap.quickSetter(progressRef.current, "scaleX")
        : null;

      // Pozície a settery nacacheované pri refreshi — v onUpdate sa už
      // z DOM nečíta nič (getBoundingClientRect tu spôsoboval layout
      // thrashing a trhaný scroll)
      let vw = window.innerWidth;
      let total = 0;
      let centers: number[] = [];
      let imgSetters: ((v: number) => void)[] = [];
      const measure = () => {
        vw = window.innerWidth;
        total = calc();
        centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
        imgSetters = images.map((img) => gsap.quickSetter(img, "xPercent") as (v: number) => void);
      };

      gsap.to(track, {
        x: () => -calc(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${calc()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: (self) => {
            progressSet?.(self.progress);
            // index počítadla — priamy zápis do DOM, žiadny re-render
            if (counterRef.current) {
              const idx = Math.min(
                Math.floor((self.progress * total) / (vw * 0.42)),
                products.length - 1,
              );
              counterRef.current.textContent = String(idx + 1).padStart(2, "0");
            }
            if (prefersReducedMotion()) return;
            // skew podľa rýchlosti ťahu
            skewTo(gsap.utils.clamp(-4, 4, self.getVelocity() / 600));
            // vnútorná parallaxa obrázkov — čisto z matematiky transformu
            const trackX = -self.progress * total;
            for (let i = 0; i < centers.length; i++) {
              imgSetters[i]((centers[i] + trackX - vw / 2) / vw * 7);
            }
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <>
      {/* ── MOBILE: natívny horizontálny scroll so snapom ── */}
      <div className="bg-[#0D1321] md:hidden">
        <div className="px-6 pb-6 pt-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C5D86D]">
            {t.badge}
          </p>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-bold leading-tight text-[#FFEDDF]">
              {t.title1}<br />{t.title2}
            </h2>
            <span className="mb-1 flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#FFEDDF]/30">
              {t.scroll}
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className="flex flex-row gap-4 overflow-x-auto pb-10 pl-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/${lang}/products/${p.id}`}
                className="relative block flex-shrink-0 overflow-hidden"
                style={{ width: "72vw", height: "52vw", scrollSnapAlign: "start" }}
              >
                <Image src={p.img} alt="" fill className="object-cover" sizes="72vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/90 via-[#0D1321]/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C5D86D]">
                    {t.categories[p.category] ?? p.category}
                  </span>
                  <h3 className="mt-0.5 font-display text-base font-bold leading-snug text-[#FFEDDF]">
                    {p.name}
                  </h3>
                  <span className="font-display text-base font-bold text-[#FFEDDF]">
                    {p.price} €
                  </span>
                </div>
              </Link>
            ))}
            <div className="w-4 flex-shrink-0" />
          </div>
          {/* pravý fade — naznačuje ďalší obsah */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0D1321] to-transparent" />
        </div>
      </div>

      {/* ── DESKTOP: pripnutá sekcia, scroll ide doprava ── */}
      <section
        ref={sectionRef}
        className="relative hidden overflow-hidden bg-[#0D1321] md:block"
        style={{ height: "100dvh" }}
        data-cursor="drag"
      >
        {/* Hlavička */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 px-16 pt-14 lg:px-24">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C5D86D]">
            {t.badge}
          </p>
          <h2 className="font-display text-5xl font-bold leading-tight text-[#FFEDDF] lg:text-6xl">
            {t.title1}<br />{t.title2}
          </h2>
          <p className="mt-3 text-sm text-[#FFEDDF]/30">{t.scroll}</p>
        </div>

        {/* Počítadlo */}
        <div className="pointer-events-none absolute right-16 top-14 z-20 text-right">
          <span className="font-display text-5xl font-bold leading-none text-[#FFEDDF]/10">
            <span ref={counterRef}>01</span>
          </span>
          <span className="block text-xs tracking-widest text-[#FFEDDF]/20">
            / {String(products.length).padStart(2, "0")}
          </span>
        </div>

        {/* Posúvaný pás */}
        <div
          ref={trackRef}
          className="flex h-full flex-row flex-nowrap items-end will-change-transform"
          style={{
            paddingLeft: "clamp(220px, 32vw, 500px)",
            paddingRight: "8vw",
            paddingBottom: "80px",
            gap: "clamp(16px, 2vw, 32px)",
            width: "max-content",
          }}
        >
          {products.map((p, i) => (
            <CardContent key={p.id} p={p} i={i} lang={lang} t={t} />
          ))}
        </div>

        {/* Progres */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-[#FFEDDF]/10">
          <div
            ref={progressRef}
            className="h-full origin-left bg-[#C5D86D] will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </section>
    </>
  );
}
