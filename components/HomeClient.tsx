"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, setupGsap, ScrollTrigger, prefersReducedMotion } from "@/components/fx/gsap";
import { wireReveals } from "@/components/fx/reveal";
import Magnetic from "@/components/fx/Magnetic";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import HorizontalScroll from "@/components/HorizontalScroll";
import type { Product } from "@/lib/products";
import type { WoodProduct } from "@/lib/wood";
import type { Dictionary } from "@/lib/i18n";

const statValues = [
  { value: 10, suffix: "+" },
  { value: 5, suffix: "" },
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
  const rootRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      wireReveals(rootRef.current!);

      // ── Počítadlá štatistík ───────────────────────────────────
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
              duration: 1.8,
              ease: "power3.out",
              onUpdate: () => {
                el.textContent = Math.round(obj.val).toString();
              },
            });
          },
        });
      });

      // ── Marquee reaguje na rýchlosť scrollu ───────────────────
      // (len lacný skew transform; mutácia animationDuration nútila
      // prehliadač prepočítavať CSS animáciu počas scrollu)
      if (marqueeRef.current && !prefersReducedMotion()) {
        const skewTo = gsap.quickTo(marqueeRef.current, "skewX", { duration: 0.5, ease: "power2.out" });
        ScrollTrigger.create({
          onUpdate: (self) => {
            skewTo(gsap.utils.clamp(-8, 8, self.getVelocity() / 350));
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const featured = products.slice(0, 3);
  const showcase = products;
  const featuredWood = woodProducts.filter((w) => w.inStock).slice(0, 3);
  const statsLabels: string[] = dict.statsLabels as string[];
  const marqueeItems: string[] = dict.marquee as string[];
  const aboutTitleParts = dict.home.aboutTitle.split("\n");

  return (
    <div ref={rootRef}>
      <Hero t={dict.hero} lang={lang} />

      {/* ── Štatistiky ── */}
      <section className="border-t border-[#FFEDDF]/5 bg-[#0D1321] px-6 py-24">
        <div
          ref={statsRef}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-4"
          data-reveal="fade"
          data-children
          data-stagger="0.1"
        >
          {statValues.map((s, i) => (
            <div key={i} className="relative text-center md:border-l md:border-[#FFEDDF]/10 md:first:border-l-0">
              <p className="mb-3 font-display text-5xl font-bold tabular-nums text-[#C5D86D] md:text-6xl">
                <span className="stat-num" data-target={s.value}>0</span>
                <span>{s.suffix}</span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFEDDF]/40">
                {statsLabels[i]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="overflow-hidden bg-[#C5D86D] py-3">
        <div ref={marqueeRef} className="marquee-track flex gap-0 whitespace-nowrap" aria-hidden>
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#0D1321]"
            >
              {item}
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0D1321]/40" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Drevo — karty ── */}
      <section className="bg-[#FFEDDF] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p
                className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#86615C]"
                data-reveal="fade"
              >
                {dict.home.woodBadge}
              </p>
              <h2
                className="mb-4 font-display text-4xl font-bold text-[#0D1321] md:text-6xl"
                data-reveal="lines"
              >
                {dict.home.woodTitle}
              </h2>
              <p className="max-w-xl text-lg text-[#86615C]" data-reveal="fade" data-delay="0.15">
                {dict.home.woodSub}
              </p>
            </div>
            <Link
              href={`/${lang}/drevo`}
              className="link-line pb-1 text-sm font-semibold text-[#0D1321]"
              data-reveal="fade"
              data-delay="0.3"
            >
              {dict.home.woodCtaBtn}
            </Link>
          </div>

          <div
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            data-reveal="fade"
            data-children
            data-stagger="0.12"
          >
            {featuredWood.map((w) => (
              <Link
                key={w.id}
                href={`/${lang}/drevo`}
                className="card-shine group block overflow-hidden bg-[#0D1321]"
                data-cursor="view"
                data-cursor-label={dict.labels.view}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={w.img}
                    alt={w.label}
                    fill
                    className="object-cover opacity-80 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1321]/80 to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="bg-[#C5D86D] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0D1321]">
                      {dict.labels.species[w.species] ?? w.species}
                    </span>
                    {w.naturalEdge && (
                      <span className="bg-[#86615C] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#FFEDDF]">
                        {dict.home.naturalEdge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 font-display text-lg font-semibold text-[#FFEDDF] transition-colors group-hover:text-[#C5D86D]">
                    {w.label}
                  </h3>
                  <p className="mb-4 font-mono text-xs text-[#FFEDDF]/40">
                    {w.thickness / 10} × {w.width / 10} × {w.length / 10} cm &nbsp;·&nbsp; {w.surface}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-bold text-[#C5D86D]">{w.price} €</span>
                    <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#FFEDDF]/40">
                      {dict.labels.states[w.state] ?? w.state}
                      <svg
                        className="h-3.5 w-3.5 -translate-x-1 text-[#C5D86D] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — drevo ── */}
      <section className="relative overflow-hidden bg-[#C5D86D] px-6 py-28">
        <div
          className="pointer-events-none absolute -bottom-8 left-0 select-none overflow-hidden"
          data-speed="0.92"
        >
          <span
            className="block font-display font-bold leading-none text-[#0D1321]/[0.05]"
            style={{ fontSize: "clamp(120px, 16vw, 240px)" }}
          >
            BELIWOOD
          </span>
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <h2
            className="mb-6 font-display text-4xl font-bold text-[#0D1321] md:text-6xl"
            data-reveal="lines"
          >
            {dict.home.woodCtaTitle}
          </h2>
          <p
            className="mx-auto mb-12 max-w-xl text-lg text-[#0D1321]/70"
            data-reveal="fade"
            data-delay="0.15"
          >
            {dict.home.woodCtaSub}
          </p>
          <div data-reveal="fade" data-delay="0.25">
            <Magnetic>
              <Link
                href={`/${lang}/drevo`}
                className="btn-sweep inline-flex items-center gap-3 bg-[#0D1321] px-10 py-5 text-sm font-semibold tracking-wide text-[#FFEDDF] [--btn-sweep-bg:#86615C]"
              >
                <span className="btn-label">
                  <span data-text={dict.home.woodCtaBtn}>{dict.home.woodCtaBtn}</span>
                </span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ── Horizontálny scroll — kolekcia ── */}
      <HorizontalScroll
        products={showcase}
        lang={lang}
        t={{
          badge: dict.home.hsBadge,
          title1: dict.home.hsTitle1,
          title2: dict.home.hsTitle2,
          scroll: dict.home.hsScroll,
          view: dict.labels.view,
          categories: dict.labels.productCategories,
        }}
      />

      {/* ── Nábytok ── */}
      <ProductGrid
        products={featured}
        title={dict.home.furnitureTitle}
        subtitle={dict.home.furnitureSub}
        addToCartLabel={dict.products.addToCart}
        labels={{ categories: dict.labels.productCategories, view: dict.labels.view }}
      />

      {/* ── O nás ── */}
      <section id="about" className="overflow-hidden bg-[#FFEDDF] px-6 py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div
            className="relative aspect-[4/3] overflow-hidden"
            data-reveal="clip"
            data-clip="inset(0 100% 0 0)"
          >
            <Image
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80"
              alt="Náš ateliér"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              data-speed="auto"
            />
          </div>

          <div className="space-y-6">
            <p
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#86615C]"
              data-reveal="fade"
            >
              {dict.home.aboutBadge}
            </p>
            <h2
              className="font-display text-4xl font-bold leading-tight text-[#0D1321] md:text-5xl"
              data-reveal="lines"
            >
              {aboutTitleParts[0]}
              {aboutTitleParts[1] && <><br />{aboutTitleParts[1]}</>}
            </h2>
            <p className="text-lg leading-relaxed text-[#86615C]" data-reveal="lines" data-stagger="0.05">
              {dict.home.aboutP1}
            </p>
            <p className="leading-relaxed text-[#86615C]" data-reveal="lines" data-stagger="0.05">
              {dict.home.aboutP2}
            </p>
            <div className="pt-2" data-reveal="fade">
              <Link
                href={`/${lang}/kolekcia`}
                className="link-line is-active inline-flex items-center gap-2 pb-1 text-sm font-semibold text-[#0D1321]"
              >
                {dict.home.aboutLink}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
