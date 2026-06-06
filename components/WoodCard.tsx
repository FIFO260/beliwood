"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import type { WoodProduct } from "@/lib/wood";
import type { Product } from "@/lib/products";

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
}

interface Props {
  wood: WoodProduct;
  t: WoodCardT;
}

function woodToProduct(w: WoodProduct): Product {
  return {
    id: w.id,
    name: w.label,
    price: w.price,
    category: "doplnky",
    img: w.img,
    description: w.description,
    material: `Masívny ${w.species}`,
    dimensions: `${w.thickness} × ${w.width} × ${w.length} mm`,
  };
}

const stateColors: Record<string, string> = {
  "Sušené v sušičke": "bg-[#C5D86D] text-[#0D1321]",
  Vzduchosuché: "bg-[#FFEDDF] text-[#86615C]",
  Čerstvé: "bg-[#0D1321]/70 text-[#FFEDDF]",
};

export default function WoodCard({ wood, t }: Props) {
  const { addItem, openCart } = useCartStore();

  const handleAdd = () => {
    addItem(woodToProduct(wood));
    openCart();
  };

  return (
    <div className={`bg-white border border-[#86615C]/15 flex flex-col ${!wood.inStock ? "opacity-70" : ""}`}>
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#86615C]/10">
        <Image
          src={wood.img}
          alt=""
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="bg-[#0D1321]/80 text-[#FFEDDF] text-xs font-semibold px-2.5 py-1 tracking-wide">
            {wood.species}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 ${stateColors[wood.state] ?? ""}`}>
            {wood.state}
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
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-[#0D1321] text-base mb-3 leading-snug">
          {wood.label}
        </h3>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <Spec label={t.specThickness} value={`${wood.thickness} mm`} />
          <Spec label={t.specWidth} value={`${wood.width} mm`} />
          <Spec label={t.specLength} value={`${(wood.length / 1000).toFixed(1).replace(".", ",")} m`} />
          <Spec label={t.specMoisture} value={`${wood.moisture} %`} />
          <Spec label={t.specSurface} value={wood.surface} className="col-span-2" />
        </div>

        <p className="text-[#86615C] text-xs leading-relaxed mb-5 line-clamp-2">{wood.description}</p>

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
