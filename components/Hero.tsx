"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { gsap, setupGsap, SplitText, prefersReducedMotion } from "@/components/fx/gsap";
import { onSiteReady } from "@/components/fx/Preloader";
import Magnetic from "@/components/fx/Magnetic";

const HeroScene = dynamic(() => import("@/components/fx/HeroScene"), { ssr: false });

interface HeroT {
  tagline: string;
  line1: string;
  line2: string;
  sub: string;
  ctaWood: string;
  ctaFurniture: string;
  scroll: string;
}

export default function Hero({ t, lang }: { t: HeroT; lang: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      // ── Vstup po skončení preloadera ──────────────────────────
      const split = new SplitText(headingRef.current, { type: "chars,lines", mask: "lines" });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "beli" } });

      tl.from(taglineRef.current, { yPercent: 130, duration: 0.8 }, 0.1)
        .from(
          split.chars,
          { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.025 },
          0.25,
        )
        .from(subRef.current, { y: 28, autoAlpha: 0, duration: 0.9 }, "-=0.6")
        .from(ctaRef.current!.children, { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, "-=0.6")
        .from(metaRef.current!.children, { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, "-=0.5")
        .from(scrollLineRef.current, { scaleY: 0, transformOrigin: "top center", duration: 1 }, "-=0.4");

      const cancel = onSiteReady(() => tl.play());
      // poistka — keby signál z preloadera nedorazil (zaseknutý storage,
      // chyba v inom skripte…), úvodný text sa po chvíli ukáže aj tak
      const failSafe = window.setTimeout(() => tl.play(), 4000);

      // ── Odchod pri scrolle — obsah sa prepadá do hĺbky ────────
      // explicitný fromTo: štart sa nesmie zachytávať z computed štýlov
      // (počas page-transition by sa odčítal ako neviditeľný)
      gsap.fromTo(
        ".hero-content",
        { yPercent: 0, autoAlpha: 1 },
        {
          yPercent: -18,
          autoAlpha: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "85% top",
            scrub: true,
          },
        },
      );

      return () => {
        cancel();
        window.clearTimeout(failSafe);
        split.revert();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-[#0D1321]"
    >
      {/* Pozadie s parallaxou (ScrollSmoother data-speed) */}
      <div className="absolute inset-0" data-speed="0.75">
        <Image
          src="https://cswoods.com/cdn/shop/files/CSWDenverWarehouse.jpg?v=1646946963&width=2000"
          alt=""
          fill
          className="scale-110 object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1321] via-[#0D1321]/85 to-[#0D1321]/40" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0D1321] to-transparent" />
      </div>

      {/* Drevený prach — WebGL (sám sa vypne na mobile/reduced-motion) */}
      <HeroScene />

      {/* Obrovský obrysový watermark */}
      <div
        className="pointer-events-none absolute bottom-10 right-0 select-none overflow-hidden"
        data-speed="0.9"
      >
        <span
          className="text-stroke block font-display font-bold leading-none"
          style={{ fontSize: "clamp(140px, 20vw, 300px)" }}
        >
          MASÍV
        </span>
      </div>

      {/* Obsah */}
      <div className="hero-content relative z-10 w-full px-8 pb-28 pt-28 md:px-16 lg:px-24">
        <div className="max-w-3xl">
          <div className="mb-7 overflow-hidden">
            <span
              ref={taglineRef}
              className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-[#C5D86D] md:text-sm"
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#C5D86D]" />
              {t.tagline}
            </span>
          </div>

          <h1
            ref={headingRef}
            className="mb-7 font-display text-6xl font-bold leading-[0.98] text-[#FFEDDF] md:text-8xl lg:text-9xl"
          >
            {t.line1}{" "}
            <em className="italic text-[#C5D86D]">{t.line2}</em>
          </h1>

          <p
            ref={subRef}
            className="mb-11 max-w-lg text-lg leading-relaxed text-[#FFEDDF]/60 md:text-xl"
          >
            {t.sub}
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center gap-5">
            <Magnetic>
              <Link
                href={`/${lang}/drevo`}
                className="btn-sweep inline-flex items-center gap-3 bg-[#C5D86D] px-9 py-4 text-sm font-semibold tracking-wide text-[#0D1321] [--btn-sweep-bg:#FFEDDF]"
              >
                <span className="btn-label">
                  <span data-text={t.ctaWood}>{t.ctaWood}</span>
                </span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link
                href={`/${lang}/products`}
                className="link-line inline-flex items-center gap-2 py-2 text-sm font-medium tracking-wide text-[#FFEDDF]/80 transition-colors hover:text-[#C5D86D]"
              >
                {t.ctaFurniture}
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Spodný meta riadok */}
      <div
        ref={metaRef}
        className="absolute bottom-8 left-0 right-0 z-10 hidden items-end justify-between px-8 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFEDDF]/30 md:flex md:px-16 lg:px-24"
      >
        <span>Beliwood — Slovensko</span>
        <div className="flex flex-col items-center gap-2 text-[#FFEDDF]/40">
          <span>{t.scroll}</span>
          <div
            ref={scrollLineRef}
            className="h-14 w-px bg-gradient-to-b from-[#C5D86D]/70 to-transparent"
          />
        </div>
        <span>Dub · Orech · Buk</span>
      </div>
    </section>
  );
}
