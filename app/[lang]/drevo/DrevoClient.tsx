"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { gsap, setupGsap, prefersReducedMotion } from "@/components/fx/gsap";
import PageHeader from "@/components/PageHeader";
import WoodCard from "@/components/WoodCard";
import type { WoodProduct, WoodSpecies, WoodSurface, WoodState, WoodCategory, ThicknessRange } from "@/lib/wood";
import { allSpecies, allSurfaces, allStates, allCategories, allThicknessRanges, getThicknessRange } from "@/lib/wood";

interface WoodT {
  badge: string;
  title: string;
  sub: string;
  filters: string;
  clearAll: string;
  clearCount: string;
  noResults: string;
  noResultsSub: string;
  resetFilters: string;
  inStockOnly: string;
  filterState: string;
  filterSpecies: string;
  filterThickness: string;
  filterSurface: string;
  filterAvailability: string;
  filterCategory: string;
  filterPrice: string;
  priceFrom: string;
  priceTo: string;
  availAll: string;
  availInStock: string;
  availOnOrder: string;
  stateAll: string;
  stateFresh: string;
  stateAirDry: string;
  stateKiln: string;
  naturalEdge: string;
  inStock: string;
  onOrder: string;
  specThickness: string;
  specWidth: string;
  specLength: string;
  specMoisture: string;
  specSurface: string;
  perPiece: string;
  addToCart: string;
  inquire: string;
  catHodiny: string;
  catStoly: string;
  catKonferencny: string;
  catPostele: string;
  catKniznice: string;
  catDoskaUmyvadlo: string;
  catForsty: string;
  catMonolity: string;
  catHranoly: string;
  catPriecneRezy: string;
  catKorene: string;
  catAtyp: string;
}

type StateFilter = "Všetko" | WoodState;

type Availability = "all" | "inStock" | "onOrder";

interface Filters {
  species: WoodSpecies[];
  state: StateFilter;
  thicknessRanges: ThicknessRange[];
  surfaces: WoodSurface[];
  categories: WoodCategory[];
  availability: Availability;
  priceMin: number;
  priceMax: number;
}

const defaultFilters: Filters = {
  species: [],
  state: "Všetko",
  thicknessRanges: [],
  surfaces: [],
  categories: [],
  availability: "all",
  priceMin: 0,
  priceMax: 0,
};

export default function DrevoClient({
  woodProducts,
  t,
  labels,
  lang,
}: {
  woodProducts: WoodProduct[];
  t: WoodT;
  labels: {
    species: Record<string, string>;
    states: Record<string, string>;
    surfaces: Record<string, string>;
  };
  lang: string;
}) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return woodProducts.filter((w) => {
      if (filters.species.length && !filters.species.includes(w.species)) return false;
      if (filters.state !== "Všetko" && w.state !== filters.state) return false;
      if (filters.thicknessRanges.length && !filters.thicknessRanges.includes(getThicknessRange(w.thickness))) return false;
      if (filters.surfaces.length && !filters.surfaces.includes(w.surface)) return false;
      if (filters.categories.length && !filters.categories.includes(w.category)) return false;
      if (filters.availability === "inStock" && !w.inStock) return false;
      if (filters.availability === "onOrder" && w.inStock) return false;
      if (filters.priceMin > 0 && w.price < filters.priceMin) return false;
      if (filters.priceMax > 0 && w.price > filters.priceMax) return false;
      return true;
    });
  }, [filters, woodProducts]);

  // jemný stagger kariet pri každej zmene filtrov
  useEffect(() => {
    if (prefersReducedMotion()) return;
    setupGsap();
    const cards = gridRef.current?.children;
    if (!cards?.length) return;
    const tween = gsap.fromTo(
      cards,
      { y: 26, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, ease: "beli-out", stagger: 0.045, clearProps: "all" },
    );
    return () => {
      tween.kill();
    };
  }, [filtered]);

  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const activeCount =
    filters.species.length +
    filters.thicknessRanges.length +
    filters.surfaces.length +
    filters.categories.length +
    (filters.state !== "Všetko" ? 1 : 0) +
    (filters.availability !== "all" ? 1 : 0) +
    (filters.priceMin > 0 ? 1 : 0) +
    (filters.priceMax > 0 ? 1 : 0);

  const stateOptions: { value: StateFilter; label: string }[] = [
    { value: "Všetko", label: t.stateAll },
    { value: "Čerstvé", label: t.stateFresh },
    { value: "Vzduchosuché", label: t.stateAirDry },
    { value: "Sušené v sušičke", label: t.stateKiln },
  ];

  const thicknessLabels: Record<ThicknessRange, string> = {
    "10-60": "1–6 cm",
    "60-100": "6–10 cm",
    "100-150": "10–15 cm",
  };

  const categoryLabels: Record<WoodCategory, string> = {
    hodiny: t.catHodiny,
    stoly: t.catStoly,
    "konferencny-stol": t.catKonferencny,
    postele: t.catPostele,
    kniznice: t.catKniznice,
    "doska-umyvadlo": t.catDoskaUmyvadlo,
    forsty: t.catForsty,
    monolity: t.catMonolity,
    hranoly: t.catHranoly,
    "priecne-rezy": t.catPriecneRezy,
    korene: t.catKorene,
    atyp: t.catAtyp,
  };

  const woodCardT = {
    naturalEdge: t.naturalEdge,
    onOrder: t.onOrder,
    perPiece: t.perPiece,
    addToCart: t.addToCart,
    inquire: t.inquire,
    specThickness: t.specThickness,
    specWidth: t.specWidth,
    specLength: t.specLength,
    specMoisture: t.specMoisture,
    specSurface: t.specSurface,
    speciesLabels: labels.species,
    stateLabels: labels.states,
    surfaceLabels: labels.surfaces,
  };

  return (
    <>
      <PageHeader badge={t.badge} title={t.title} sub={t.sub} />

      <div className="bg-[#FFEDDF] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <aside className="lg:w-64 flex-shrink-0">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="lg:hidden w-full flex items-center justify-between bg-white border border-[#86615C]/20 px-5 py-3 mb-4 text-sm font-semibold text-[#0D1321]"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                  </svg>
                  {t.filters}
                  {activeCount > 0 && (
                    <span className="bg-[#C5D86D] text-[#0D1321] text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {activeCount}
                    </span>
                  )}
                </span>
                <svg className={`w-4 h-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <div className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-6`}>
                {activeCount > 0 && (
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="text-xs text-[#86615C] underline underline-offset-2 hover:text-[#0D1321] transition-colors"
                  >
                    {t.clearAll} ({activeCount})
                  </button>
                )}

                {/* Stav dreva */}
                <FilterBlock title={t.filterState}>
                  {stateOptions.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="state"
                        checked={filters.state === value}
                        onChange={() => setFilters((f) => ({ ...f, state: value }))}
                        className="accent-[#C5D86D] w-4 h-4"
                      />
                      <span className="text-sm text-[#0D1321] group-hover:text-[#86615C] transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </FilterBlock>

                {/* Drevina */}
                <FilterBlock title={t.filterSpecies}>
                  {allSpecies.map((sp) => {
                    const count = woodProducts.filter((w) => w.species === sp).length;
                    return (
                      <label key={sp} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.species.includes(sp)}
                          onChange={() => setFilters((f) => ({ ...f, species: toggle(f.species, sp) }))}
                          className="accent-[#C5D86D] w-4 h-4 rounded-none"
                        />
                        <span className="text-sm text-[#0D1321] group-hover:text-[#86615C] transition-colors flex-1">{labels.species[sp] ?? sp}</span>
                        <span className="text-xs text-[#86615C]/60">{count}</span>
                      </label>
                    );
                  })}
                </FilterBlock>

                {/* Hrúbka */}
                <FilterBlock title={t.filterThickness}>
                  <div className="flex flex-wrap gap-2">
                    {allThicknessRanges.map((range) => {
                      const active = filters.thicknessRanges.includes(range);
                      return (
                        <button
                          key={range}
                          onClick={() => setFilters((f) => ({ ...f, thicknessRanges: toggle(f.thicknessRanges, range) }))}
                          className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                            active
                              ? "bg-[#0D1321] text-[#FFEDDF] border-[#0D1321]"
                              : "bg-white text-[#86615C] border-[#86615C]/30 hover:border-[#0D1321] hover:text-[#0D1321]"
                          }`}
                        >
                          {thicknessLabels[range]}
                        </button>
                      );
                    })}
                  </div>
                </FilterBlock>

                {/* Povrchová úprava */}
                <FilterBlock title={t.filterSurface}>
                  {allSurfaces.map((s) => (
                    <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.surfaces.includes(s)}
                        onChange={() => setFilters((f) => ({ ...f, surfaces: toggle(f.surfaces, s) }))}
                        className="accent-[#C5D86D] w-4 h-4"
                      />
                      <span className="text-sm text-[#0D1321] group-hover:text-[#86615C] transition-colors">{labels.surfaces[s] ?? s}</span>
                    </label>
                  ))}
                </FilterBlock>

                {/* Typ produktu */}
                <FilterBlock title={t.filterCategory}>
                  {allCategories.map((cat) => {
                    const count = woodProducts.filter((w) => w.category === cat).length;
                    if (count === 0) return null;
                    return (
                      <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(cat)}
                          onChange={() => setFilters((f) => ({ ...f, categories: toggle(f.categories, cat) }))}
                          className="accent-[#C5D86D] w-4 h-4 rounded-none"
                        />
                        <span className="text-sm text-[#0D1321] group-hover:text-[#86615C] transition-colors flex-1">
                          {categoryLabels[cat]}
                        </span>
                        <span className="text-xs text-[#86615C]/60">{count}</span>
                      </label>
                    );
                  })}
                </FilterBlock>

                {/* Dostupnosť */}
                <FilterBlock title={t.filterAvailability}>
                  {([["all", t.availAll], ["inStock", t.availInStock], ["onOrder", t.availOnOrder]] as [Availability, string][]).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="availability"
                        checked={filters.availability === value}
                        onChange={() => setFilters((f) => ({ ...f, availability: value }))}
                        className="accent-[#C5D86D] w-4 h-4"
                      />
                      <span className="text-sm text-[#0D1321] group-hover:text-[#86615C] transition-colors">{label}</span>
                    </label>
                  ))}
                </FilterBlock>

                {/* Cena */}
                <FilterBlock title={t.filterPrice}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={t.priceFrom}
                      value={filters.priceMin || ""}
                      onChange={(e) => setFilters((f) => ({ ...f, priceMin: parseInt(e.target.value) || 0 }))}
                      min={0}
                      className="w-full border border-[#86615C]/30 px-2 py-1.5 text-sm text-[#0D1321] focus:outline-none focus:border-[#0D1321] bg-white"
                    />
                    <span className="text-[#86615C]/60 flex-shrink-0">—</span>
                    <input
                      type="number"
                      placeholder={t.priceTo}
                      value={filters.priceMax || ""}
                      onChange={(e) => setFilters((f) => ({ ...f, priceMax: parseInt(e.target.value) || 0 }))}
                      min={0}
                      className="w-full border border-[#86615C]/30 px-2 py-1.5 text-sm text-[#0D1321] focus:outline-none focus:border-[#0D1321] bg-white"
                    />
                    <span className="text-[#86615C] text-xs flex-shrink-0">€</span>
                  </div>
                </FilterBlock>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[#86615C] text-sm">
                  <span className="font-semibold text-[#0D1321]">{filtered.length}</span>{" "}
                  {filtered.length === 1 ? "produkt" : filtered.length < 5 ? "produkty" : "produktov"}
                </p>
                {activeCount > 0 && (
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="text-xs text-[#86615C] hover:text-[#0D1321] underline underline-offset-2 transition-colors"
                  >
                    {t.clearCount}
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-[#86615C] text-lg font-medium mb-2">{t.noResults}</p>
                  <p className="text-[#86615C]/60 text-sm mb-6">{t.noResultsSub}</p>
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="bg-[#0D1321] text-[#FFEDDF] px-6 py-3 text-sm font-semibold hover:bg-[#C5D86D] hover:text-[#0D1321] transition-colors"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              ) : (
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((w) => (
                    <WoodCard key={w.id} wood={w} t={woodCardT} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#86615C]/15 p-5">
      <h3 className="text-[10px] font-bold text-[#86615C] tracking-[0.2em] uppercase mb-4">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
