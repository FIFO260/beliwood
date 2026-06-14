"use client";

import { useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { gsap, setupGsap, prefersReducedMotion } from "@/components/fx/gsap";
import { useCartStore } from "@/store/cartStore";
import { woodToProduct, type WoodProduct } from "@/lib/wood";

interface WoodT {
  badge: string;
  title: string;
  naturalEdge: string;
  inStock: string;
  onOrder: string;
  perPiece: string;
  addToCart: string;
  inquire: string;
  specThickness: string;
  specWidth: string;
  specLength: string;
  specMoisture: string;
  specSurface: string;
  filterSpecies: string;
}
interface DetailT {
  home: string;
  orderNow: string;
  delivery: string;
  related: string;
}
type Labels = {
  species: Record<string, string>;
  states: Record<string, string>;
  surfaces: Record<string, string>;
};

export default function WoodDetailClient({
  wood,
  related,
  t,
  detailT,
  navWood,
  labels,
  lang,
}: {
  wood: WoodProduct | null;
  related: WoodProduct[];
  t: WoodT;
  detailT: DetailT;
  navWood: string;
  labels: Labels;
  lang: string;
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from(imgRef.current, { clipPath: "inset(0 100% 0 0)", duration: 1.2, ease: "beli" });
      gsap.from(imgRef.current!.querySelector("img"), { scale: 1.25, duration: 1.6, ease: "beli" });
      gsap.from(infoRef.current!.children, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: "beli-out",
        stagger: 0.09,
        delay: 0.15,
      });
    });
    return () => ctx.revert();
  }, [wood?.id]);

  if (!wood) notFound();

  const handleAdd = () => {
    addItem(woodToProduct(wood));
    openCart();
  };

  const specs: { label: string; value: string }[] = [
    { label: t.filterSpecies, value: labels.species[wood.species] ?? wood.species },
    { label: t.specThickness, value: `${wood.thickness / 10} cm` },
    { label: t.specWidth, value: `${wood.width / 10} cm` },
    { label: t.specLength, value: `${(wood.length / 1000).toFixed(1).replace(".", ",")} m` },
    { label: t.specMoisture, value: `${wood.moisture} %` },
    { label: t.specSurface, value: labels.surfaces[wood.surface] ?? wood.surface },
  ];

  return (
    <div className="min-h-screen bg-[#FFEDDF] px-6 pb-20 pt-24">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-10 flex items-center gap-2 text-sm text-[#86615C]">
          <Link href={`/${lang}/`} className="transition-colors hover:text-[#0D1321]">{detailT.home}</Link>
          <span>/</span>
          <Link href={`/${lang}/drevo`} className="transition-colors hover:text-[#0D1321]">{navWood}</Link>
          <span>/</span>
          <span className="font-medium text-[#0D1321]">{wood.label}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div ref={imgRef} className="card-shine relative aspect-square overflow-hidden bg-[#86615C]/10">
            <Image
              src={wood.img}
              alt={wood.label}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="bg-[#0D1321]/80 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-[#C5D86D] backdrop-blur-sm">
                {labels.species[wood.species] ?? wood.species}
              </span>
              {wood.naturalEdge && (
                <span className="bg-[#86615C]/80 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-[#FFEDDF] backdrop-blur-sm">
                  {t.naturalEdge}
                </span>
              )}
            </div>
            {!wood.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1321]/40">
                <span className="bg-[#0D1321] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#FFEDDF]">
                  {t.onOrder}
                </span>
              </div>
            )}
          </div>

          <div ref={infoRef} className="py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#86615C]">
              {labels.states[wood.state] ?? wood.state}
            </p>
            <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-[#0D1321] md:text-5xl">
              {wood.label}
            </h1>
            <p className="mb-8 font-display text-4xl font-bold text-[#0D1321]">
              {wood.price} <span className="text-2xl font-normal text-[#86615C]">€</span>
              <span className="ml-2 text-base font-normal text-[#86615C]">{t.perPiece}</span>
            </p>

            <p className="mb-10 text-base leading-relaxed text-[#86615C]">{wood.description}</p>

            <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-1 border-t border-[#86615C]/20 pt-8">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between border-b border-[#86615C]/10 py-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#86615C]">{s.label}</span>
                  <span className="text-sm font-medium text-[#0D1321]">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleAdd}
                disabled={!wood.inStock}
                className="btn-sweep flex-1 bg-[#0D1321] py-4 text-center text-sm font-semibold tracking-wide text-[#FFEDDF] [--btn-sweep-bg:#C5D86D] hover:text-[#0D1321] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>{wood.inStock ? t.addToCart : t.inquire}</span>
              </button>
              <Link
                href={`/${lang}/checkout`}
                onClick={handleAdd}
                className={`flex-1 border-2 border-[#0D1321] py-4 text-center text-sm font-semibold tracking-wide text-[#0D1321] transition-colors hover:bg-[#0D1321] hover:text-[#FFEDDF] ${
                  !wood.inStock ? "pointer-events-none opacity-40" : ""
                }`}
              >
                {detailT.orderNow}
              </Link>
            </div>

            <p className="mt-5 text-center text-xs text-[#86615C]">{detailT.delivery}</p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-10 font-display text-3xl font-bold text-[#0D1321]">{detailT.related}</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((w) => (
                <Link key={w.id} href={`/${lang}/drevo/${w.id}`} className="group block">
                  <div className="card-shine relative mb-4 aspect-[4/3] overflow-hidden">
                    <Image
                      src={w.img}
                      alt={w.label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <p className="font-display font-semibold text-[#0D1321] transition-colors group-hover:text-[#86615C]">
                    {w.label}
                  </p>
                  <p className="mt-1 text-sm text-[#86615C]">{w.price} €</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
