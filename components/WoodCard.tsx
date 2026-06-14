"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { woodToProduct, type WoodProduct } from "@/lib/wood";

export interface WoodCardT {
  naturalEdge: string;
  onOrder: string;
  perPiece: string;
  addToCart: string;
  inquire: string;
  specThickness: string;
  specWidth: string;
  specLength: string;
  specMoisture: string;
  specSurface: string;
  speciesLabels: Record<string, string>;
  stateLabels: Record<string, string>;
  surfaceLabels: Record<string, string>;
  viewDetail: string;
  viewLabel: string;
}

interface Props {
  wood: WoodProduct;
  t: WoodCardT;
  lang: string;
}

const stateColors: Record<string, string> = {
  "Sušené v sušičke": "bg-[#C5D86D] text-[#0D1321]",
  Vzduchosuché: "bg-[#FFEDDF] text-[#86615C]",
  Čerstvé: "bg-[#0D1321]/70 text-[#FFEDDF]",
};

export default function WoodCard({ wood, t, lang }: Props) {
  const { addItem, openCart } = useCartStore();
  const href = `/${lang}/drevo/${wood.id}`;

  const handleAdd = () => {
    addItem(woodToProduct(wood));
    openCart();
  };

  return (
    <div
      className={`group flex flex-col border border-[#86615C]/15 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-[#86615C]/35 hover:shadow-[0_18px_40px_-18px_rgba(13,19,33,0.25)] ${!wood.inStock ? "opacity-70" : ""}`}
    >
      {/* Image — klik na detail */}
      <Link
        href={href}
        aria-label={wood.label}
        className="card-shine relative aspect-[16/10] overflow-hidden bg-[#86615C]/10 block"
        data-cursor="view"
        data-cursor-label={t.viewLabel}
      >
        <Image
          src={wood.img}
          alt=""
          fill
          className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="bg-[#0D1321]/80 text-[#FFEDDF] text-xs font-semibold px-2.5 py-1 tracking-wide">
            {t.speciesLabels[wood.species] ?? wood.species}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 ${stateColors[wood.state] ?? ""}`}>
            {t.stateLabels[wood.state] ?? wood.state}
          </span>
          {wood.naturalEdge && (
            <span className="bg-[#86615C]/70 text-white text-xs px-2.5 py-1">
              {t.naturalEdge}
            </span>
          )}
        </div>
        {!wood.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0D1321]/40">
            <span className="bg-[#0D1321] text-[#FFEDDF] text-xs font-semibold px-3 py-1.5 tracking-widest uppercase">
              {t.onOrder}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-[#0D1321] text-base mb-3 leading-snug">
          <Link href={href} className="transition-colors hover:text-[#86615C]">
            {wood.label}
          </Link>
        </h3>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <Spec label={t.specThickness} value={`${wood.thickness / 10} cm`} />
          <Spec label={t.specWidth} value={`${wood.width / 10} cm`} />
          <Spec label={t.specLength} value={`${(wood.length / 1000).toFixed(1).replace(".", ",")} m`} />
          <Spec label={t.specMoisture} value={`${wood.moisture} %`} />
          <Spec label={t.specSurface} value={t.surfaceLabels[wood.surface] ?? wood.surface} className="col-span-2" />
        </div>

        <Link href={href} className="text-[#86615C] text-xs leading-relaxed mb-3 line-clamp-2 block hover:text-[#0D1321] transition-colors">
          {wood.description}
        </Link>

        <Link
          href={href}
          className="link-line mb-5 inline-flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#0D1321]"
        >
          {t.viewDetail} →
        </Link>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <span className="font-display text-2xl font-bold text-[#0D1321]">{wood.price} €</span>
            <span className="text-[#86615C] text-xs ml-1">{t.perPiece}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={!wood.inStock}
            className="bg-[#0D1321] text-[#FFEDDF] text-xs font-semibold px-4 py-2.5 hover:bg-[#C5D86D] hover:text-[#0D1321] transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-wide uppercase"
          >
            {wood.inStock ? t.addToCart : t.inquire}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[#86615C] text-[10px] font-semibold tracking-widest uppercase leading-none mb-0.5">{label}</p>
      <p className="text-[#0D1321] text-xs font-medium">{value}</p>
    </div>
  );
}
