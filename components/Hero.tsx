"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const bgRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLSpanElement>(null);
  const taglineInnerRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Entrance timeline ──────────────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(taglineInnerRef.current, { yPercent: 110, duration: 0.7 })
        .from(line1Ref.current, { yPercent: 110, duration: 1.0 }, "-=0.4")
        .from(line2Ref.current, { yPercent: 110, duration: 1.0 }, "-=0.75")
        .from(subRef.current, { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(scrollLineRef.current, { scaleY: 0, duration: 1.0, ease: "power2.inOut" }, "-=0.3");

      // Decorative large text entrance
      if (decorRef.current) {
        tl.from(decorRef.current, { x: 120, opacity: 0, duration: 1.2, ease: "power3.out" }, 0.2);
      }

      // ── Scroll parallax ────────────────────────────────────────────────────
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 25,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Decorative text counter-parallax
      if (decorRef.current) {
        gsap.to(decorRef.current, {
          x: -150,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }

      // Content moves slightly slower (depth illusion)
      gsap.to(".hero-content", {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden bg-[#0D1321]">
      {/* Background image with parallax */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <Image
          src="https://cswoods.com/cdn/shop/files/CSWDenverWarehouse.jpg?v=1646946963&width=2000"
          alt="Drevený nábytok"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1321] via-[#0D1321]/80 to-transparent" />
      </div>

      {/* Decorative large background text */}
      <div className="absolute bottom-16 right-0 overflow-hidden pointer-events-none select-none">
        <span
          ref={decorRef}
          className="block font-display font-bold text-[#FFEDDF]/[0.03] leading-none"
          style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
        >
          DREVO
        </span>
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 w-full px-8 md:px-16 lg:px-24 pt-24 pb-20 will-change-transform">
        <div className="max-w-2xl">
          {/* Tagline with line reveal */}
          <div className="overflow-hidden mb-6">
            <span
              ref={taglineInnerRef}
              className="block text-[#C5D86D] text-sm font-medium tracking-[0.25em] uppercase"
            >
              {t.tagline}
            </span>
          </div>

          {/* Heading with per-line reveal */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-[#FFEDDF] leading-[1.05] mb-6">
            <span className="block overflow-hidden">
              <span ref={line1Ref} className="block">
                {t.line1}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span ref={line2Ref} className="block">
                <em className="not-italic text-[#C5D86D]">{t.line2}</em>
              </span>
            </span>
          </h1>

          <p
            ref={subRef}
            className="text-[#FFEDDF]/60 text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
          >
            {t.sub}
          </p>

          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <Link
              href={`/${lang}/drevo`}
              className="inline-flex items-center gap-2 bg-[#C5D86D] text-[#0D1321] px-8 py-4 font-semibold text-sm tracking-wide hover:bg-[#d4e87c] transition-colors"
            >
              {t.ctaWood}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={`/${lang}/products`}
              className="inline-flex items-center gap-2 border border-[#FFEDDF]/30 text-[#FFEDDF] px-8 py-4 font-medium text-sm tracking-wide hover:border-[#C5D86D] hover:text-[#C5D86D] transition-colors"
            >
              {t.ctaFurniture}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#FFEDDF]/30">
        <span className="text-xs tracking-widest uppercase">{t.scroll}</span>
        <div
          ref={scrollLineRef}
          className="w-px h-12 bg-gradient-to-b from-[#FFEDDF]/30 to-transparent origin-top"
        />
      </div>
    </section>
  );
}
