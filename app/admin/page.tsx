"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { compressImage, uploadWithProgress } from "@/lib/compressImage";
import type { Product, Category } from "@/lib/products";
import type { WoodProduct, WoodSpecies, WoodSurface, WoodState, WoodCategory } from "@/lib/wood";
import { allSpecies, allStates, allSurfaces, allCategories } from "@/lib/wood";
import type { PortfolioItem } from "@/lib/portfolio";
import type { HomepageSettings } from "@/lib/db";

type Tab = "products" | "wood" | "portfolio" | "homepage";

// ─── EMPTY FORMS ──────────────────────────────────────────────────────────────

const emptyProduct = (): Omit<Product, "id"> => ({
  name: "",
  price: 0,
  category: "nábytok",
  img: "",
  description: "",
  material: "",
  dimensions: "",
});

const emptyAbout = { badge: "", title: "", p1: "", p2: "", link: "", img: "" };

const emptyPortfolio = (): Omit<PortfolioItem, "id"> => ({
  name: "",
  category: "",
  woodSpecies: "",
  year: new Date().getFullYear(),
  description: "",
  img: "",
  featured: false,
});

const emptyWood = (): Omit<WoodProduct, "id"> => ({
  species: "Dub",
  label: "",
  thickness: 50,
  width: 200,
  length: 2000,
  moisture: 8,
  state: "Sušené v sušičke",
  surface: "Bez povrchovej úpravy",
  category: "forsty",
  price: 0,
  inStock: true,
  naturalEdge: false,
  img: "",
  description: "",
});

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [woodProducts, setWoodProducts] = useState<WoodProduct[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>({
    featuredWoodIds: [],
    showcaseProductIds: [],
    stats: [10, 5, 100, 200],
    about: emptyAbout,
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct());
  const [woodForm, setWoodForm] = useState(emptyWood());
  const [portfolioForm, setPortfolioForm] = useState(emptyPortfolio());
  const [saving, setSaving] = useState(false);
  const [homepageSaving, setHomepageSaving] = useState(false);
  const [aboutImgUploading, setAboutImgUploading] = useState(false);
  const [aboutImgPct, setAboutImgPct] = useState<number | null>(null);
  const aboutImgRef = useRef<HTMLInputElement>(null);
  const [homepageSaved, setHomepageSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Check auth on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  // ── Load data after auth ─────────────────────────────────────────────────
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    Promise.all([fetchProducts(), fetchWood(), fetchPortfolio(), fetchHomepageSettings()]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  async function fetchProducts() {
    const r = await fetch("/api/admin/products");
    if (r.status === 401) return setAuthed(false);
    if (r.ok) setProducts(await r.json());
  }

  async function fetchWood() {
    const r = await fetch("/api/admin/wood");
    if (r.status === 401) return setAuthed(false);
    if (r.ok) setWoodProducts(await r.json());
  }

  async function fetchPortfolio() {
    const r = await fetch("/api/admin/portfolio");
    if (r.status === 401) return setAuthed(false);
    if (r.ok) setPortfolioItems(await r.json());
  }

  async function fetchHomepageSettings() {
    const r = await fetch("/api/admin/homepage");
    if (r.status === 401) return setAuthed(false);
    if (r.ok) setHomepageSettings(await r.json());
  }

  // ── Open modal ───────────────────────────────────────────────────────────
  function openAdd() {
    if (tab === "products") setProductForm(emptyProduct());
    else if (tab === "wood") setWoodForm(emptyWood());
    else if (tab === "portfolio") setPortfolioForm(emptyPortfolio());
    setEditId(null);
    setModal("add");
    setError("");
  }

  function openEdit(item: Product | WoodProduct | PortfolioItem) {
    if (tab === "products") {
      const p = item as Product;
      setProductForm({
        name: p.name,
        price: p.price,
        category: p.category,
        img: p.img,
        description: p.description,
        material: p.material,
        dimensions: p.dimensions,
      });
    } else if (tab === "wood") {
      const w = item as WoodProduct;
      setWoodForm({
        species: w.species,
        label: w.label,
        thickness: w.thickness,
        width: w.width,
        length: w.length,
        moisture: w.moisture,
        state: w.state,
        surface: w.surface,
        category: w.category,
        price: w.price,
        inStock: w.inStock,
        naturalEdge: w.naturalEdge,
        img: w.img,
        description: w.description,
      });
    } else {
      const pf = item as PortfolioItem;
      setPortfolioForm({
        name: pf.name,
        category: pf.category,
        woodSpecies: pf.woodSpecies,
        year: pf.year,
        description: pf.description,
        img: pf.img,
        featured: pf.featured ?? false,
      });
    }
    setEditId(item.id);
    setModal("edit");
    setError("");
  }

  // ── Upload image ─────────────────────────────────────────────────────────
  // Mobilné fotky (5–15 MB) sa najprv zmenšia v prehliadači na ~300 kB,
  // inak upload na pomalej sieti visí a server ho odmietne (limit 4,5 MB)
  async function handleImageUpload(file: File) {
    setUploadingImg(true);
    setUploadPct(0);
    setError("");
    try {
      const compressed = await compressImage(file);
      const { url } = await uploadWithProgress("/api/admin/upload", compressed, setUploadPct);
      if (tab === "products") setProductForm((f) => ({ ...f, img: url }));
      else if (tab === "wood") setWoodForm((f) => ({ ...f, img: url }));
      else setPortfolioForm((f) => ({ ...f, img: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nahrávanie obrázka zlyhalo");
    } finally {
      setUploadingImg(false);
      setUploadPct(null);
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    const isProduct = tab === "products";
    const isWood = tab === "wood";
    const isPortfolio = tab === "portfolio";

    const name = isProduct
      ? productForm.name.trim()
      : isWood
        ? woodForm.label.trim()
        : portfolioForm.name.trim();
    if (!name) {
      setError(isProduct ? "Vyplňte názov produktu" : isWood ? "Vyplňte názov / popis" : "Vyplňte názov projektu");
      return;
    }
    if ((isProduct || isWood) && !((isProduct ? productForm.price : woodForm.price) > 0)) {
      setError("Zadajte cenu väčšiu ako 0");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const body = isProduct ? productForm : isWood ? woodForm : portfolioForm;
      const base = isProduct ? "/api/admin/products" : isWood ? "/api/admin/wood" : "/api/admin/portfolio";
      const url = modal === "edit" ? `${base}/${editId}` : base;
      const method = modal === "edit" ? "PUT" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.status === 401) {
        setAuthed(false);
        return;
      }
      if (!r.ok) throw new Error((await r.json()).error ?? "Chyba pri ukladaní");

      if (isProduct) await fetchProducts();
      else if (isWood) await fetchWood();
      else await fetchPortfolio();
      setModal(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Neznáma chyba");
    } finally {
      setSaving(false);
    }
  }

  // ── Save homepage settings ────────────────────────────────────────────────
  async function handleSaveHomepage() {
    setHomepageSaving(true);
    setHomepageSaved(false);
    setError("");
    try {
      const r = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homepageSettings),
      });
      if (r.status === 401) { setAuthed(false); return; }
      if (!r.ok) throw new Error("Chyba pri ukladaní");
      setHomepageSaved(true);
      setTimeout(() => setHomepageSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Neznáma chyba");
    } finally {
      setHomepageSaving(false);
    }
  }

  // ── Upload obrázka pre "O nás" ───────────────────────────────────────────
  async function handleAboutImgUpload(file: File) {
    setAboutImgUploading(true);
    setAboutImgPct(0);
    try {
      const compressed = await compressImage(file);
      const { url } = await uploadWithProgress("/api/admin/upload", compressed, setAboutImgPct);
      setHomepageSettings((s) => ({
        ...s,
        about: { ...(s.about ?? emptyAbout), img: url },
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nahrávanie zlyhalo");
    } finally {
      setAboutImgUploading(false);
      setAboutImgPct(null);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    if (!confirm("Naozaj chcete vymazať?")) return;
    const base = tab === "products" ? "/api/admin/products" : tab === "wood" ? "/api/admin/wood" : "/api/admin/portfolio";
    await fetch(`${base}/${id}`, { method: "DELETE" });
    if (tab === "products") await fetchProducts();
    else if (tab === "wood") await fetchWood();
    else await fetchPortfolio();
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0D1321] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C5D86D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const items =
    tab === "products" ? products : tab === "wood" ? woodProducts : tab === "portfolio" ? portfolioItems : [];

  return (
    <div className="min-h-screen bg-[#f5ede4]">
      {/* Header */}
      <header className="bg-[#0D1321] px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-[#C5D86D] text-xl font-bold">BeliWood</span>
          <span className="text-[#FFEDDF]/40 text-sm">Admin</span>
        </div>
        <button
          onClick={logout}
          className="text-[#FFEDDF]/60 hover:text-[#FFEDDF] text-sm transition-colors py-2"
        >
          Odhlásiť sa
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {/* Tabs + Add button — na mobile pod sebou */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex flex-wrap gap-1 bg-white border border-[#86615C]/20 p-1 self-start">
            <TabBtn active={tab === "products"} onClick={() => setTab("products")}>
              Produkty ({products.length})
            </TabBtn>
            <TabBtn active={tab === "wood"} onClick={() => setTab("wood")}>
              Drevo ({woodProducts.length})
            </TabBtn>
            <TabBtn active={tab === "portfolio"} onClick={() => setTab("portfolio")}>
              Portfolio ({portfolioItems.length})
            </TabBtn>
            <TabBtn active={tab === "homepage"} onClick={() => setTab("homepage")}>
              Úvodná stránka
            </TabBtn>
          </div>
          {tab !== "homepage" && (
            <button
              onClick={openAdd}
              className="bg-[#C5D86D] text-[#0D1321] px-5 py-3 text-sm font-semibold hover:bg-[#b8cc55] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg leading-none">+</span>{" "}
              {tab === "portfolio" ? "Pridať projekt" : "Pridať produkt"}
            </button>
          )}
        </div>

        {/* Homepage settings tab */}
        {tab === "homepage" ? (
          <HomepageSettingsPanel
            settings={homepageSettings}
            woodProducts={woodProducts}
            products={products}
            onChange={setHomepageSettings}
            onSave={handleSaveHomepage}
            onAboutImgUpload={handleAboutImgUpload}
            aboutImgRef={aboutImgRef}
            aboutImgUploading={aboutImgUploading}
            aboutImgPct={aboutImgPct}
            saving={homepageSaving}
            saved={homepageSaved}
            error={error}
          />
        ) : (
          /* Zoznam */
          <div className="bg-white border border-[#86615C]/15">
            {loading ? (
              <SkeletonList />
            ) : items.length === 0 ? (
              <div className="py-20 text-center text-[#86615C] px-4">
                <p className="text-lg font-medium mb-2">
                  {tab === "portfolio" ? "Žiadne projekty" : "Žiadne produkty"}
                </p>
                <p className="text-sm opacity-60">
                  Kliknite na &quot;Pridať&quot; pre vytvorenie prvého.
                </p>
              </div>
            ) : (
              <>
                {/* Mobil: karty */}
                <ul className="sm:hidden divide-y divide-[#86615C]/10">
                  {items.map((item) => (
                    <MobileCard
                      key={item.id}
                      item={item}
                      tab={tab}
                      onEdit={() => openEdit(item as Product | WoodProduct | PortfolioItem)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </ul>

                {/* Desktop: tabuľka */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[#86615C]/10 bg-[#f5ede4]">
                        <Th>{tab === "portfolio" ? "Projekt" : "Produkt"}</Th>
                        {tab === "products" ? (
                          <><Th>Kategória</Th><Th>Materiál</Th></>
                        ) : tab === "wood" ? (
                          <><Th>Drevina</Th><Th>Rozmery</Th></>
                        ) : (
                          <><Th>Kategória</Th><Th>Rok</Th></>
                        )}
                        {tab !== "portfolio" && <Th>Cena</Th>}
                        <Th right>Akcie</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <TableRow
                          key={item.id}
                          item={item}
                          tab={tab}
                          onEdit={() => openEdit(item as Product | WoodProduct | PortfolioItem)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={
            tab === "portfolio"
              ? modal === "add" ? "Pridať projekt" : "Upraviť projekt"
              : modal === "add" ? "Pridať produkt" : "Upraviť produkt"
          }
          onClose={() => setModal(null)}
          footer={
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-[#86615C]/30 text-[#86615C] py-3.5 text-sm font-medium hover:border-[#0D1321] hover:text-[#0D1321] transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingImg}
                className="flex-1 bg-[#0D1321] text-[#FFEDDF] py-3.5 text-sm font-semibold hover:bg-[#C5D86D] hover:text-[#0D1321] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {saving ? "Ukladám…" : uploadingImg ? "Čakám na obrázok…" : modal === "add" ? "Pridať" : "Uložiť"}
              </button>
            </div>
          }
        >
          {tab === "products" ? (
            <ProductForm
              form={productForm}
              onChange={setProductForm}
              onImageUpload={handleImageUpload}
              fileRef={fileRef}
              uploadingImg={uploadingImg}
              uploadPct={uploadPct}
            />
          ) : tab === "wood" ? (
            <WoodForm
              form={woodForm}
              onChange={setWoodForm}
              onImageUpload={handleImageUpload}
              fileRef={fileRef}
              uploadingImg={uploadingImg}
              uploadPct={uploadPct}
            />
          ) : (
            <PortfolioForm
              form={portfolioForm}
              onChange={setPortfolioForm}
              onImageUpload={handleImageUpload}
              fileRef={fileRef}
              uploadingImg={uploadingImg}
              uploadPct={uploadPct}
            />
          )}

          {error && (
            <p className="mt-4 text-red-600 text-sm bg-red-50 px-3 py-2.5 border border-red-200">
              {error}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!r.ok) {
        setErr("Nesprávne heslo");
        return;
      }
      onLogin();
    } catch {
      setErr("Sieťová chyba — skúste to znova");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1321] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-[#C5D86D] text-3xl font-bold mb-1">BeliWood</p>
          <p className="text-[#FFEDDF]/50 text-sm">Správa produktov</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[#FFEDDF]/70 text-xs font-semibold tracking-wider uppercase mb-2">
              Heslo
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
              className="w-full bg-white/10 border border-white/20 text-[#FFEDDF] px-4 py-3 text-base sm:text-sm focus:outline-none focus:border-[#C5D86D] transition-colors"
              placeholder="Zadajte heslo..."
            />
          </div>

          {err && (
            <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 border border-red-800/40">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full bg-[#C5D86D] text-[#0D1321] py-3 font-semibold text-sm hover:bg-[#b8cc55] transition-colors disabled:opacity-40"
          >
            {loading ? "Prihlasujem..." : "Prihlásiť sa"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── ITEM THUMB ───────────────────────────────────────────────────────────────

function Thumb({ img, size = "w-12 h-12" }: { img: string; size?: string }) {
  return img ? (
    <div className={`relative ${size} flex-shrink-0 overflow-hidden bg-[#86615C]/10`}>
      <Image
        src={img}
        alt=""
        fill
        className="object-cover"
        sizes="64px"
        unoptimized={img.startsWith("/uploads/")}
      />
    </div>
  ) : (
    <div className={`${size} flex-shrink-0 bg-[#86615C]/10 flex items-center justify-center`}>
      <span className="text-[#86615C]/30 text-[10px]">bez foto</span>
    </div>
  );
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({
  item,
  tab,
  onEdit,
  onDelete,
}: {
  item: Product | WoodProduct | PortfolioItem;
  tab: Tab;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const p = item as Product;
  const w = item as WoodProduct;
  const pf = item as PortfolioItem;

  const title = tab === "products" ? p.name : tab === "wood" ? w.label : pf.name;
  const sub =
    tab === "products"
      ? p.category
      : tab === "wood"
        ? `${w.species} · ${w.thickness / 10}×${w.width / 10}×${w.length / 10} cm`
        : `${pf.category} · ${pf.year}`;
  const price = tab !== "portfolio" ? (item as Product | WoodProduct).price : null;

  return (
    <li className="p-3.5">
      <div className="flex gap-3">
        <Thumb img={item.img} size="w-16 h-16" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[#0D1321] text-sm leading-snug truncate">{title}</p>
          <p className="text-xs text-[#86615C] mt-0.5">{sub}</p>
          <div className="flex items-center justify-between mt-1.5">
            {price !== null ? (
              <span className="font-semibold text-[#0D1321] text-sm">{price} €</span>
            ) : (
              <span />
            )}
            {tab === "portfolio" && pf.featured && (
              <span className="text-[10px] bg-[#C5D86D] text-[#0D1321] px-1.5 py-0.5 font-semibold">featured</span>
            )}
            {tab === "wood" && !w.inStock && (
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 font-medium">vypredané</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onEdit} className="flex-1 text-xs text-[#86615C] border border-[#86615C]/30 py-2.5 active:bg-[#f5ede4] transition-colors">
          Upraviť
        </button>
        <button onClick={onDelete} className="flex-1 text-xs text-red-600 border border-red-200 py-2.5 active:bg-red-50 transition-colors">
          Vymazať
        </button>
      </div>
    </li>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="divide-y divide-[#86615C]/10">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
          <div className="w-12 h-12 bg-[#86615C]/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[#86615C]/10 w-1/3" />
            <div className="h-3 bg-[#86615C]/10 w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`${right ? "text-right" : "text-left"} px-4 py-3 text-xs font-semibold text-[#86615C] tracking-wider uppercase`}
    >
      {children}
    </th>
  );
}

function TableRow({
  item,
  tab,
  onEdit,
  onDelete,
}: {
  item: Product | WoodProduct | PortfolioItem;
  tab: Tab;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const p = item as Product;
  const w = item as WoodProduct;
  const pf = item as PortfolioItem;
  const title = tab === "products" ? p.name : tab === "wood" ? w.label : pf.name;

  return (
    <tr className="border-b border-[#86615C]/10 hover:bg-[#f5ede4]/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Thumb img={item.img} />
          <span className="font-medium text-[#0D1321] text-sm">{title}</span>
        </div>
      </td>

      {tab === "products" ? (
        <>
          <td className="px-4 py-3"><span className="text-xs bg-[#0D1321]/10 text-[#0D1321] px-2 py-1 font-medium">{p.category}</span></td>
          <td className="px-4 py-3 text-sm text-[#86615C]">{p.material}</td>
        </>
      ) : tab === "wood" ? (
        <>
          <td className="px-4 py-3">
            <span className="text-xs bg-[#0D1321]/10 text-[#0D1321] px-2 py-1 font-medium">{w.species}</span>
            {!w.inStock && <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-1 font-medium">vypredané</span>}
          </td>
          <td className="px-4 py-3 text-sm text-[#86615C]">{w.thickness / 10}×{w.width / 10}×{w.length / 10} cm</td>
        </>
      ) : (
        <>
          <td className="px-4 py-3">
            <span className="text-xs bg-[#0D1321]/10 text-[#0D1321] px-2 py-1 font-medium">{pf.category}</span>
            {pf.featured && <span className="ml-1 text-xs bg-[#C5D86D] text-[#0D1321] px-2 py-1 font-semibold">featured</span>}
          </td>
          <td className="px-4 py-3 text-sm text-[#86615C]">{pf.year}</td>
        </>
      )}

      {tab !== "portfolio" && (
        <td className="px-4 py-3 font-semibold text-[#0D1321] text-sm">{(item as Product | WoodProduct).price} €</td>
      )}

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="text-xs text-[#86615C] border border-[#86615C]/30 px-3 py-1.5 hover:border-[#0D1321] hover:text-[#0D1321] transition-colors"
          >
            Upraviť
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-red-600 border border-red-200 px-3 py-1.5 hover:bg-red-50 transition-colors"
          >
            Vymazať
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
// Na mobile fullscreen sheet so sticky hlavičkou aj tlačidlami — formulár sa
// scrolluje, akcie sú vždy na dosah palca

function Modal({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  // zamkni scroll pozadia, kým je modal otvorený
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 sm:backdrop-blur-sm sm:p-4 flex sm:items-start sm:justify-center">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:max-w-2xl sm:mt-4 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#0D1321] flex-shrink-0">
          <h2 className="font-display text-lg font-bold text-[#FFEDDF]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Zavrieť"
            className="text-[#FFEDDF]/50 hover:text-[#FFEDDF] text-2xl leading-none transition-colors -m-2 p-2"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5">
          {children}
        </div>

        <div className="flex-shrink-0 border-t border-[#86615C]/10 bg-white px-4 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      </div>
    </div>
  );
}

// ─── IMAGE FIELD ──────────────────────────────────────────────────────────────

function ImageField({
  imgUrl,
  onChange,
  onUpload,
  fileRef,
  uploading,
  uploadPct,
}: {
  imgUrl: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  uploadPct: number | null;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-2">
        Obrázok
      </label>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          value={imgUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL obrázka alebo nahrajte súbor..."
          className="flex-1 border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-[#f5ede4] border border-[#86615C]/30 px-4 py-2.5 text-sm font-medium text-[#86615C] hover:border-[#0D1321] hover:text-[#0D1321] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {uploading ? `Nahrávam… ${uploadPct ?? 0} %` : "📷 Nahrať fotku"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* progres uploadu */}
      {uploading && (
        <div className="h-1 bg-[#86615C]/15 mb-2 overflow-hidden">
          <div
            className="h-full bg-[#C5D86D] transition-[width] duration-200"
            style={{ width: `${uploadPct ?? 0}%` }}
          />
        </div>
      )}

      {imgUrl && !uploading && (
        <div className="relative w-full h-36 sm:h-32 overflow-hidden bg-[#86615C]/10">
          <Image
            src={imgUrl}
            alt="náhľad"
            fill
            className="object-cover"
            sizes="600px"
            unoptimized={imgUrl.startsWith("/uploads/")}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-[#0D1321]/80 text-[#FFEDDF] text-xs px-2.5 py-1.5 hover:bg-red-600 transition-colors"
          >
            ✕ Odstrániť
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────────────────────────

function ProductForm({
  form,
  onChange,
  onImageUpload,
  fileRef,
  uploadingImg,
  uploadPct,
}: {
  form: Omit<Product, "id">;
  onChange: (f: Omit<Product, "id">) => void;
  onImageUpload: (file: File) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploadingImg: boolean;
  uploadPct: number | null;
}) {
  const set = (key: keyof typeof form) => (val: string | number) =>
    onChange({ ...form, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Názov produktu *">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            className={inputCls}
            placeholder="Dubový jedálenský stôl"
          />
        </Field>
        <Field label="Cena (€) *">
          <input
            type="number"
            inputMode="decimal"
            value={form.price || ""}
            onChange={(e) => set("price")(parseFloat(e.target.value) || 0)}
            className={inputCls}
            placeholder="0"
            min={0}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Kategória *">
          <select
            value={form.category}
            onChange={(e) => set("category")(e.target.value as Category)}
            className={inputCls}
          >
            <option value="nábytok">Nábytok</option>
            <option value="doplnky">Doplnky</option>
            <option value="kuchyňa">Kuchyňa</option>
          </select>
        </Field>
        <Field label="Materiál">
          <input
            type="text"
            value={form.material}
            onChange={(e) => set("material")(e.target.value)}
            className={inputCls}
            placeholder="Masívny dub, prírodný olej"
          />
        </Field>
      </div>

      <Field label="Rozmery">
        <input
          type="text"
          value={form.dimensions}
          onChange={(e) => set("dimensions")(e.target.value)}
          className={inputCls}
          placeholder="200 × 90 × 75 cm"
        />
      </Field>

      <Field label="Popis">
        <textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Popis produktu..."
        />
      </Field>

      <ImageField
        imgUrl={form.img}
        onChange={(url) => onChange({ ...form, img: url })}
        onUpload={onImageUpload}
        fileRef={fileRef}
        uploading={uploadingImg}
        uploadPct={uploadPct}
      />
    </div>
  );
}

// ─── WOOD FORM ────────────────────────────────────────────────────────────────

function WoodForm({
  form,
  onChange,
  onImageUpload,
  fileRef,
  uploadingImg,
  uploadPct,
}: {
  form: Omit<WoodProduct, "id">;
  onChange: (f: Omit<WoodProduct, "id">) => void;
  onImageUpload: (file: File) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploadingImg: boolean;
  uploadPct: number | null;
}) {
  const set =
    (key: keyof typeof form) => (val: string | number | boolean) =>
      onChange({ ...form, [key]: val });

  return (
    <div className="space-y-4">
      <Field label="Názov / Popis *">
        <input
          type="text"
          value={form.label}
          onChange={(e) => set("label")(e.target.value)}
          className={inputCls}
          placeholder="Dubová doska — živá hrana"
        />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Field label="Drevina *">
          <select
            value={form.species}
            onChange={(e) => set("species")(e.target.value as WoodSpecies)}
            className={inputCls}
          >
            {allSpecies.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Stav">
          <select
            value={form.state}
            onChange={(e) => set("state")(e.target.value as WoodState)}
            className={inputCls}
          >
            {allStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Povrch">
          <select
            value={form.surface}
            onChange={(e) => set("surface")(e.target.value as WoodSurface)}
            className={inputCls}
          >
            {allSurfaces.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Typ produktu *">
        <select
          value={form.category}
          onChange={(e) => set("category")(e.target.value as WoodCategory)}
          className={inputCls}
        >
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Field label="Hrúbka (cm) *">
          <input
            type="number"
            inputMode="numeric"
            value={form.thickness || ""}
            onChange={(e) => set("thickness")(parseInt(e.target.value) || 0)}
            className={inputCls}
            min={0}
          />
        </Field>
        <Field label="Šírka (cm) *">
          <input
            type="number"
            inputMode="numeric"
            value={form.width || ""}
            onChange={(e) => set("width")(parseInt(e.target.value) || 0)}
            className={inputCls}
            min={0}
          />
        </Field>
        <Field label="Dĺžka (cm) *">
          <input
            type="number"
            inputMode="numeric"
            value={form.length || ""}
            onChange={(e) => set("length")(parseInt(e.target.value) || 0)}
            className={inputCls}
            min={0}
          />
        </Field>
        <Field label="Vlhkosť (%)">
          <input
            type="number"
            inputMode="numeric"
            value={form.moisture || ""}
            onChange={(e) => set("moisture")(parseInt(e.target.value) || 0)}
            className={inputCls}
            min={0}
            max={100}
          />
        </Field>
      </div>

      <Field label="Cena (€) *">
        <input
          type="number"
          inputMode="decimal"
          value={form.price || ""}
          onChange={(e) => set("price")(parseFloat(e.target.value) || 0)}
          className={inputCls}
          min={0}
        />
      </Field>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => set("inStock")(e.target.checked)}
            className="accent-[#C5D86D] w-5 h-5"
          />
          <span className="text-sm text-[#0D1321] font-medium">Skladom</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={form.naturalEdge}
            onChange={(e) => set("naturalEdge")(e.target.checked)}
            className="accent-[#C5D86D] w-5 h-5"
          />
          <span className="text-sm text-[#0D1321] font-medium">Živá hrana</span>
        </label>
      </div>

      <Field label="Popis">
        <textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Popis produktu..."
        />
      </Field>

      <ImageField
        imgUrl={form.img}
        onChange={(url) => onChange({ ...form, img: url })}
        onUpload={onImageUpload}
        fileRef={fileRef}
        uploading={uploadingImg}
        uploadPct={uploadPct}
      />
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// text-base na mobile — pri menšom písme iOS Safari automaticky zoomuje
// do inputu a rozhádže celý viewport
const inputCls =
  "w-full border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── PORTFOLIO FORM ───────────────────────────────────────────────────────────

function PortfolioForm({
  form,
  onChange,
  onImageUpload,
  fileRef,
  uploadingImg,
  uploadPct,
}: {
  form: Omit<PortfolioItem, "id">;
  onChange: (f: Omit<PortfolioItem, "id">) => void;
  onImageUpload: (file: File) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploadingImg: boolean;
  uploadPct: number | null;
}) {
  const set = <K extends keyof Omit<PortfolioItem, "id">>(key: K) =>
    (val: Omit<PortfolioItem, "id">[K]) => onChange({ ...form, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Názov projektu *">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            className={inputCls}
            placeholder="Jedálenský stôl z dubu"
          />
        </Field>
        <Field label="Rok">
          <input
            type="number"
            inputMode="numeric"
            value={form.year || ""}
            onChange={(e) => set("year")(parseInt(e.target.value) || new Date().getFullYear())}
            className={inputCls}
            placeholder={String(new Date().getFullYear())}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Kategória">
          <input
            type="text"
            value={form.category}
            onChange={(e) => set("category")(e.target.value)}
            className={inputCls}
            placeholder="Stôl, Polica, Schodisko..."
          />
        </Field>
        <Field label="Drevina">
          <input
            type="text"
            value={form.woodSpecies}
            onChange={(e) => set("woodSpecies")(e.target.value)}
            className={inputCls}
            placeholder="Dub, Orech, Buk..."
          />
        </Field>
      </div>

      <Field label="Popis">
        <textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Krátky popis projektu..."
        />
      </Field>

      <div className="flex items-center gap-2.5">
        <input
          type="checkbox"
          id="pf-featured"
          checked={form.featured ?? false}
          onChange={(e) => set("featured")(e.target.checked)}
          className="accent-[#C5D86D] w-5 h-5"
        />
        <label htmlFor="pf-featured" className="text-sm text-[#0D1321] font-medium">
          Zobraziť ako featured (veľká karta) v portfolio
        </label>
      </div>

      <ImageField
        imgUrl={form.img}
        onChange={(url) => onChange({ ...form, img: url })}
        onUpload={onImageUpload}
        fileRef={fileRef}
        uploading={uploadingImg}
        uploadPct={uploadPct}
      />
    </div>
  );
}

// ─── HOMEPAGE SETTINGS PANEL ──────────────────────────────────────────────────

const STAT_LABELS = ["Roky skúseností", "Krajiny", "Spokojnosť (%)", "Projektov+"];
const STAT_SUFFIXES = ["+", "", "%", "+"];

function HomepageSettingsPanel({
  settings,
  woodProducts,
  products,
  onChange,
  onSave,
  onAboutImgUpload,
  aboutImgRef,
  aboutImgUploading,
  aboutImgPct,
  saving,
  saved,
  error,
}: {
  settings: HomepageSettings;
  woodProducts: WoodProduct[];
  products: Product[];
  onChange: (s: HomepageSettings) => void;
  onSave: () => void;
  onAboutImgUpload: (file: File) => void;
  aboutImgRef: React.RefObject<HTMLInputElement | null>;
  aboutImgUploading: boolean;
  aboutImgPct: number | null;
  saving: boolean;
  saved: boolean;
  error: string;
}) {
  const toggleShowcase = (id: number) => {
    const ids = settings.showcaseProductIds ?? [];
    if (ids.includes(id)) {
      onChange({ ...settings, showcaseProductIds: ids.filter((x) => x !== id) });
    } else if (ids.length < 7) {
      onChange({ ...settings, showcaseProductIds: [...ids, id] });
    }
  };

  const toggleFeatured = (id: number) => {
    const ids = settings.featuredWoodIds;
    if (ids.includes(id)) {
      onChange({ ...settings, featuredWoodIds: ids.filter((x) => x !== id) });
    } else if (ids.length < 3) {
      onChange({ ...settings, featuredWoodIds: [...ids, id] });
    }
  };

  return (
    <div className="bg-white border border-[#86615C]/15 p-5 sm:p-8 space-y-8">
      {/* Featured drevo produkty */}
      <div>
        <h3 className="font-display text-lg font-semibold text-[#0D1321] mb-1">
          Odporúčané produkty masívneho dreva
        </h3>
        <p className="text-xs text-[#86615C] mb-4">
          Vyberte max. 3 produkty, ktoré sa zobrazia v sekcii &quot;Masívne drevo&quot;. Ak nevyberiete žiadny, zobrazia sa prvé 3 skladom automaticky.
        </p>
        <ul className="divide-y divide-[#86615C]/10 border border-[#86615C]/15">
          {woodProducts.map((w) => {
            const checked = settings.featuredWoodIds.includes(w.id);
            const disabled = !checked && settings.featuredWoodIds.length >= 3;
            return (
              <li
                key={w.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? "bg-[#C5D86D]/10" : disabled ? "opacity-40" : "hover:bg-[#f5ede4]/60"}`}
                onClick={() => !disabled && toggleFeatured(w.id)}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => !disabled && toggleFeatured(w.id)}
                  disabled={disabled}
                  className="accent-[#C5D86D] w-4 h-4 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <Thumb img={w.img} size="w-10 h-10" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0D1321] truncate">{w.label}</p>
                  <p className="text-xs text-[#86615C]">{w.species} · {w.price} €{!w.inStock ? " · vypredané" : ""}</p>
                </div>
              </li>
            );
          })}
        </ul>
        {settings.featuredWoodIds.length > 0 && (
          <button
            onClick={() => onChange({ ...settings, featuredWoodIds: [] })}
            className="mt-2 text-xs text-[#86615C] hover:text-red-600 transition-colors"
          >
            Zrušiť výber (použiť automaticky)
          </button>
        )}
      </div>

      {/* Ručne vyrobené — showcase */}
      <div>
        <h3 className="font-display text-lg font-semibold text-[#0D1321] mb-1">
          Sekcia „Ručne vyrobené"
        </h3>
        <p className="text-xs text-[#86615C] mb-4">
          Vyberte max. 7 produktov, ktoré sa zobrazia v horizontálnom scrolli. Ak nevyberiete žiadny, zobrazia sa všetky automaticky.
        </p>
        <ul className="divide-y divide-[#86615C]/10 border border-[#86615C]/15">
          {products.map((p) => {
            const ids = settings.showcaseProductIds ?? [];
            const checked = ids.includes(p.id);
            const disabled = !checked && ids.length >= 7;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? "bg-[#C5D86D]/10" : disabled ? "opacity-40" : "hover:bg-[#f5ede4]/60"}`}
                onClick={() => !disabled && toggleShowcase(p.id)}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => !disabled && toggleShowcase(p.id)}
                  disabled={disabled}
                  className="accent-[#C5D86D] w-4 h-4 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <Thumb img={p.img} size="w-10 h-10" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0D1321] truncate">{p.name}</p>
                  <p className="text-xs text-[#86615C]">{p.category} · {p.price} €</p>
                </div>
                {checked && (
                  <span className="text-xs text-[#86615C] flex-shrink-0">
                    #{(settings.showcaseProductIds ?? []).indexOf(p.id) + 1}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {(settings.showcaseProductIds ?? []).length > 0 && (
          <button
            onClick={() => onChange({ ...settings, showcaseProductIds: [] })}
            className="mt-2 text-xs text-[#86615C] hover:text-red-600 transition-colors"
          >
            Zrušiť výber (zobraziť všetky)
          </button>
        )}
      </div>

      {/* O nás */}
      <div>
        <h3 className="font-display text-lg font-semibold text-[#0D1321] mb-1">
          Sekcia „O nás"
        </h3>
        <p className="text-xs text-[#86615C] mb-4">
          Upravte texty sekcie na úvodnej stránke. Prázdne pole = použije sa predvolený text.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-1.5">Badge</label>
            <input
              type="text"
              value={settings.about?.badge ?? ""}
              onChange={(e) => onChange({ ...settings, about: { ...(settings.about ?? emptyAbout), badge: e.target.value } })}
              placeholder="O nás"
              className="w-full border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-1.5">Nadpis <span className="normal-case font-normal text-[#86615C]/60">(použite \n pre zalomenie riadku)</span></label>
            <input
              type="text"
              value={settings.about?.title ?? ""}
              onChange={(e) => onChange({ ...settings, about: { ...(settings.about ?? emptyAbout), title: e.target.value } })}
              placeholder="Remeslo odovzdávané\nz generácie na generáciu"
              className="w-full border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-1.5">Odsek 1</label>
            <textarea
              value={settings.about?.p1 ?? ""}
              onChange={(e) => onChange({ ...settings, about: { ...(settings.about ?? emptyAbout), p1: e.target.value } })}
              rows={3}
              placeholder="BeliWood vznikol z lásky k drevu..."
              className="w-full border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-1.5">Odsek 2</label>
            <textarea
              value={settings.about?.p2 ?? ""}
              onChange={(e) => onChange({ ...settings, about: { ...(settings.about ?? emptyAbout), p2: e.target.value } })}
              rows={3}
              placeholder="Nepoužívame lacné náhradky..."
              className="w-full border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-1.5">Text odkazu</label>
            <input
              type="text"
              value={settings.about?.link ?? ""}
              onChange={(e) => onChange({ ...settings, about: { ...(settings.about ?? emptyAbout), link: e.target.value } })}
              placeholder="Naša kolekcia →"
              className="w-full border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors bg-white"
            />
          </div>
          <ImageField
            imgUrl={settings.about?.img ?? ""}
            onChange={(url) => onChange({ ...settings, about: { ...(settings.about ?? emptyAbout), img: url } })}
            onUpload={onAboutImgUpload}
            fileRef={aboutImgRef}
            uploading={aboutImgUploading}
            uploadPct={aboutImgPct}
          />
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="font-display text-lg font-semibold text-[#0D1321] mb-1">
          Štatistiky
        </h3>
        <p className="text-xs text-[#86615C] mb-4">Čísla zobrazené v sekcii so štatistikami.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(settings.stats ?? [10, 5, 100, 200]).map((val, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold text-[#86615C] tracking-wider uppercase mb-1.5">
                {STAT_LABELS[i]}{STAT_SUFFIXES[i] && <span className="ml-1 text-[#C5D86D]">{STAT_SUFFIXES[i]}</span>}
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={val}
                min={0}
                onChange={(e) => {
                  const newStats = [...(settings.stats ?? [10, 5, 100, 200])];
                  newStats[i] = parseInt(e.target.value) || 0;
                  onChange({ ...settings, stats: newStats });
                }}
                className="w-full border border-[#86615C]/30 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:border-[#0D1321] transition-colors bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2.5 border border-red-200">{error}</p>
      )}

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full sm:w-auto bg-[#0D1321] text-[#FFEDDF] px-8 py-3.5 text-sm font-semibold hover:bg-[#C5D86D] hover:text-[#0D1321] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? "Ukladám…" : saved ? "✓ Uložené" : "Uložiť nastavenia"}
      </button>
    </div>
  );
}

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors ${
        active ? "bg-[#0D1321] text-[#FFEDDF]" : "text-[#86615C] hover:text-[#0D1321]"
      }`}
    >
      {children}
    </button>
  );
}
