"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import HorizontalScroll from "@/components/HorizontalScroll";
import type { Product } from "@/lib/products";
import type { WoodProduct } from "@/lib/wood";
import type { Dictionary } from "@/lib/i18n";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const statValues = [
  { value: 10, suffix: "+" },
  { value: 5, suffix: " rokov" },
  { value: 100, suffix: "%" },
  { value: 200, suffix: "+" },
];

export default function HomeClient({
  products,
  woodProducts,
  dict,
  lang,
}: {
  products: Product[];
  woodProducts: WoodProduct[];
  dict: Dictionary;
  lang: string;
}) {
  const statsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stats counter
      const statEls = statsRef.current?.querySelectorAll<HTMLElement>(".stat-num");
      statEls?.forEach((el) => {
        const target = parseInt(el.dataset.target ?? "0", 10);
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 1.5,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = Math.round(obj.val).toString();
              },
            });
          },
        });
      });

      // About section — line-by-line reveal
      if (aboutRef.current) {
        const lines = aboutRef.current.querySelectorAll<HTMLElement>(".reveal-line");
        lines.forEach((line) => {
          const inner = line.querySelector<HTMLElement>(".reveal-inner");
          if (inner) {
            gsap.from(inner, {
              yPercent: 100,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: line,
                start: "top 88%",
              },
            });
          }
        });

        // About image: clip-path reveal
        const aboutImg = aboutRef.current.querySelector<HTMLElement>(".about-img");
        if (aboutImg) {
          gsap.from(aboutImg, {
            clipPath: "inset(0 100% 0 0)",
            duration: 1.4,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: aboutImg,
              start: "top 80%",
            },
          });
        }

        // About text blocks fade up
        const reveals = aboutRef.current.querySelectorAll<HTMLElement>(".reveal");
        gsap.from(reveals, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: aboutRef.current,
            start: "top 75%",
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const featured = products.slice(0, 3);
  const showcase = products;
  const featuredWood = woodProducts.filter((w) => w.inStock).slice(0, 3);
  const statsLabels: string[] = dict.statsLabels as string[];
  const marqueeItems: string[] = dict.marquee as string[];

  // Parse aboutTitle to handle newline
  const aboutTitleParts = dict.home.aboutTitle.split("\n");

  return (
    <>
      <Hero t={dict.hero} lang={lang} />

      {/* Stats */}
      <section className="bg-[#0D1321] py-20 px-6">
        <div
          ref={statsRef}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {statValues.map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-4xl md:text-5xl font-bold text-[#C5D86D] mb-2">
                <span className="stat-num" data-target={s.value}>
                  0
                </span>
                <span>{s.suffix}</span>
              </p>
              <p className="text-[#FFEDDF]/50 text-sm tracking-wide">{statsLabels[i]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee strip */}
      <div className="bg-[#C5D86D] py-3 overflow-hidden">
        <div className="marquee-track flex gap-0 whitespace-nowrap" aria-hidden>
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 text-[#0D1321] text-xs font-semibold tracking-[0.2em] uppercase px-8"
            >
              {item}
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D1321]/40 inline-block" />
            </span>
          ))}
        </div>
      </div>

      {/* Featured wood products */}
      <section className="py-24 px-6 bg-[#FFEDDF]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase mb-3">{dict.home.woodBadge}</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0D1321] mb-4">
              {dict.home.woodTitle}
            </h2>
            <p className="text-[#86615C] text-lg max-w-xl">
              {dict.home.woodSub}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWood.map((w) => (
              <Link key={w.id} href={`/${lang}/drevo`} className="group block bg-[#0D1321] overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={w.img}
                    alt={w.label}
                    fill
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/80 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-[#C5D86D] text-[#0D1321] text-[10px] font-bold px-2 py-1 tracking-wide uppercase">
                      {w.species}
                    </span>
                    {w.naturalEdge && (
                      <span className="bg-[#86615C] text-[#FFEDDF] text-[10px] font-semibold px-2 py-1 tracking-wide uppercase">
                        {dict.home.naturalEdge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-[#FFEDDF] mb-2 group-hover:text-[#C5D86D] transition-colors">
                    {w.label}
                  </h3>
                  <p className="text-[#FFEDDF]/40 text-xs font-mono mb-4">
                    {w.thickness} × {w.width} × {w.length} mm &nbsp;·&nbsp; {w.surface}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-bold text-[#C5D86D]">{w.price} €</span>
                    <span className="text-[#FFEDDF]/40 text-xs tracking-wide uppercase">{w.state}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Primary CTA — drevo */}
      <section className="py-20 px-6 bg-[#C5D86D]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0D1321] mb-6">
            {dict.home.woodCtaTitle}
          </h2>
          <p className="text-[#0D1321]/70 text-lg mb-10 max-w-xl mx-auto">
            {dict.home.woodCtaSub}
          </p>
          <Link
            href={`/${lang}/drevo`}
            className="inline-flex items-center gap-2 bg-[#0D1321] text-[#FFEDDF] px-10 py-4 font-semibold text-sm tracking-wide hover:bg-[#FFEDDF] hover:text-[#0D1321] transition-colors"
          >
            {dict.home.woodCtaBtn}
          </Link>
        </div>
      </section>

      {/* Horizontal scroll — furniture (secondary) */}
      <HorizontalScroll
        products={showcase}
        lang={lang}
        t={{
          badge: dict.home.hsBadge,
          title1: dict.home.hsTitle1,
          title2: dict.home.hsTitle2,
          scroll: dict.home.hsScroll,
        }}
      />

      {/* Featured furniture grid (secondary) */}
      <ProductGrid
        products={featured}
        title={dict.home.furnitureTitle}
        subtitle={dict.home.furnitureSub}
        addToCartLabel={dict.products.addToCart}
      />

      {/* About */}
      <section id="about" ref={aboutRef} className="py-24 px-6 bg-[#FFEDDF]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="about-img reveal relative aspect-[4/3] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"
              alt="Náš ateliér"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-6">
            <p className="reveal text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase">
              {dict.home.aboutBadge}
            </p>
            <h2 className="reveal font-display text-4xl md:text-5xl font-bold text-[#0D1321] leading-tight">
              {aboutTitleParts[0]}
              {aboutTitleParts[1] && <><br />{aboutTitleParts[1]}</>}
            </h2>
            <p className="reveal text-[#86615C] text-lg leading-relaxed">
              {dict.home.aboutP1}
            </p>
            <p className="reveal text-[#86615C] leading-relaxed">
              {dict.home.aboutP2}
            </p>
            <div className="reveal pt-2">
              <Link
                href={`/${lang}/products`}
                className="inline-flex items-center gap-2 text-[#0D1321] font-semibold text-sm border-b-2 border-[#C5D86D] pb-0.5 hover:border-[#0D1321] transition-colors"
              >
                {dict.home.aboutLink}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
