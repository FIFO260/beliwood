"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "@/lib/products";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HScrollT {
  badge: string;
  title1: string;
  title2: string;
  scroll: string;
}

function CardContent({ p, i, lang }: { p: Product; i: number; lang: string }) {
  return (
    <Link
      href={`/${lang}/products/${p.id}`}
      className="h-card group flex-shrink-0 relative overflow-hidden block"
      style={{
        width: "clamp(240px, 72vw, 520px)",
        height: "clamp(280px, 55vh, 620px)",
      }}
    >
      <Image
        src={p.img}
        alt=""
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 767px) 72vw, 42vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/90 via-[#0D1321]/20 to-transparent" />
      <span className="absolute top-4 right-4 font-display text-5xl font-bold text-[#FFEDDF]/10 leading-none select-none">
        {String(i + 1).padStart(2, "0")}
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-[#C5D86D] text-[10px] font-semibold tracking-[0.2em] uppercase">
          {p.category}
        </span>
        <h3 className="font-display text-lg md:text-2xl font-bold text-[#FFEDDF] mt-1 leading-tight">
          {p.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display text-lg font-bold text-[#FFEDDF]">
            {p.price} €
          </span>
          <span className="text-[#C5D86D] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wider">
            Zobraziť →
          </span>
        </div>
      </div>
      <div className="absolute inset-0 border border-[#C5D86D]/0 group-hover:border-[#C5D86D]/30 transition-all duration-500" />
    </Link>
  );
}

export default function HorizontalScroll({ products, t, lang }: { products: Product[]; t: HScrollT; lang: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!wrapperRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const wrapper = wrapperRef.current!;

      const calc = () => track.scrollWidth - window.innerWidth;

      const setHeight = () => {
        wrapper.style.height = `calc(100dvh + ${calc()}px)`;
      };
      setHeight();
      ScrollTrigger.refresh();

      const st = ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: () => `+=${calc()}`,
        scrub: 1,
        invalidateOnRefresh: true,
        onRefresh: setHeight,
        onUpdate: (self) => {
          gsap.set(track, { x: -self.progress * calc() });
          if (progressRef.current) {
            gsap.set(progressRef.current, { scaleX: self.progress });
          }
          const cardWidth = window.innerWidth * 0.42;
          const idx = Math.min(
            Math.floor((self.progress * calc()) / cardWidth),
            products.length - 1
          );
          setActiveIdx(idx);
        },
      });

      return () => {
        st.kill();
        wrapper.style.height = "";
      };
    });

    return () => ctx.revert();
  }, [products]);

  return (
    <>
      {/* ── MOBILE layout ── */}
      <div className="md:hidden bg-[#0D1321]">
        <div className="px-6 pt-20 pb-6">
          <p className="text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            {t.badge}
          </p>
          <h2 className="font-display text-4xl font-bold text-[#FFEDDF] leading-tight">
            {t.title1}<br />{t.title2}
          </h2>
        </div>

        <div
          className="flex flex-row overflow-x-auto gap-4 pl-6 pb-10"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {products.map((p, i) => (
            <Link
              key={p.id}
              href={`/${lang}/products/${p.id}`}
              className="flex-shrink-0 relative overflow-hidden block"
              style={{ width: "75vw", height: "55vw", scrollSnapAlign: "start" }}
            >
              <Image src={p.img} alt="" fill className="object-cover" sizes="75vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/90 via-[#0D1321]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-[#C5D86D] text-[9px] font-semibold tracking-[0.2em] uppercase">
                  {p.category}
                </span>
                <h3 className="font-display text-base font-bold text-[#FFEDDF] mt-0.5 leading-snug">
                  {p.name}
                </h3>
                <span className="font-display text-base font-bold text-[#FFEDDF]">
                  {p.price} €
                </span>
              </div>
            </Link>
          ))}
          {/* trailing padding */}
          <div className="flex-shrink-0 w-2" />
        </div>
      </div>

      {/* ── DESKTOP layout ── */}
      <div ref={wrapperRef} className="hidden md:block relative bg-[#0D1321]">
        <section
          className="md:sticky md:top-0 bg-[#0D1321] overflow-hidden"
          style={{ height: "100dvh" }}
        >
          {/* Header overlay */}
          <div className="absolute top-0 left-0 z-20 px-16 lg:px-24 pt-14 pointer-events-none">
            <p className="text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase mb-3">
              {t.badge}
            </p>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-[#FFEDDF] leading-tight">
              {t.title1}<br />{t.title2}
            </h2>
            <p className="text-[#FFEDDF]/30 text-sm mt-3">
              {t.scroll}
            </p>
          </div>

          {/* Counter */}
          <div className="absolute top-14 right-16 z-20 text-right pointer-events-none">
            <span className="font-display text-5xl font-bold text-[#FFEDDF]/10 leading-none">
              {String(activeIdx + 1).padStart(2, "0")}
            </span>
            <span className="block text-[#FFEDDF]/20 text-xs tracking-widest">
              / {String(products.length).padStart(2, "0")}
            </span>
          </div>

          {/* Scrolling track */}
          <div
            ref={trackRef}
            className="flex flex-row flex-nowrap items-end h-full will-change-transform"
            style={{
              paddingLeft: "clamp(220px, 32vw, 500px)",
              paddingRight: "8vw",
              paddingBottom: "80px",
              gap: "clamp(16px, 2vw, 32px)",
              width: "max-content",
            }}
          >
            {products.map((p, i) => (
              <CardContent key={p.id} p={p} i={i} lang={lang} />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#FFEDDF]/10 z-20">
            <div
              ref={progressRef}
              className="h-full bg-[#C5D86D] origin-left will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
