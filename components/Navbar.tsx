"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LanguageSwitcher from "@/components/LanguageSwitcher";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface NavT {
  home: string;
  wood: string;
  kolekcia: string;
  furniture: string;
  about: string;
  cartLabel: string;
  menuLabel: string;
}

export default function Navbar({ t, lang }: { t: NavT; lang: string }) {
  const { count, openCart } = useCartStore();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const navClass = (path: string) => {
    const active = path === `/${lang}` || path === `/${lang}/`
      ? pathname === `/${lang}` || pathname === `/${lang}/`
      : pathname.startsWith(path);
    return `text-sm font-medium transition-colors ${active ? "text-[#C5D86D]" : "text-[#FFEDDF]/70 hover:text-[#C5D86D]"}`;
  };
  const lastScrollY = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateNavH = () => {
      const pct = (gsap.getProperty(nav, "yPercent") as number) || 0;
      const h = Math.max(0, 64 * (1 + pct / 100));
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        gsap.to(nav, { yPercent: -100, duration: 0.3, ease: "power2.inOut", onUpdate: updateNavH });
      } else {
        gsap.to(nav, { yPercent: 0, duration: 0.3, ease: "power2.inOut", onUpdate: updateNavH });
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = count();

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0D1321]/95 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${lang}/`} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="BeliWood" style={{ height: 36, width: 120 }} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href={`/${lang}/`} className={navClass(`/${lang}`)}>
            {t.home}
          </Link>
          <Link href={`/${lang}/drevo`} className={navClass(`/${lang}/drevo`)}>
            {t.wood}
          </Link>
          <Link href={`/${lang}/kolekcia`} className={navClass(`/${lang}/kolekcia`)}>
            {t.kolekcia}
          </Link>
          <Link href={`/${lang}/products`} className={navClass(`/${lang}/products`)}>
            {t.furniture}
          </Link>
          <Link href={`/${lang}/#about`} className="text-sm font-medium transition-colors text-[#FFEDDF]/70 hover:text-[#C5D86D]">
            {t.about}
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLang={lang} />

          <button
            onClick={openCart}
            className="relative p-2 text-[#FFEDDF] hover:text-[#C5D86D] transition-colors"
            aria-label={t.cartLabel}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5D86D] text-[#0D1321] text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[#FFEDDF]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t.menuLabel}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D1321] border-t border-[#FFEDDF]/10 px-6 py-4 flex flex-col gap-4">
          <Link href={`/${lang}/`} onClick={() => setMenuOpen(false)} className={navClass(`/${lang}`)}>{t.home}</Link>
          <Link href={`/${lang}/drevo`} onClick={() => setMenuOpen(false)} className={navClass(`/${lang}/drevo`)}>{t.wood}</Link>
          <Link href={`/${lang}/kolekcia`} onClick={() => setMenuOpen(false)} className={navClass(`/${lang}/kolekcia`)}>{t.kolekcia}</Link>
          <Link href={`/${lang}/products`} onClick={() => setMenuOpen(false)} className={navClass(`/${lang}/products`)}>{t.furniture}</Link>
          <Link href={`/${lang}/#about`} onClick={() => setMenuOpen(false)} className="text-[#FFEDDF]/70 hover:text-[#C5D86D] text-sm font-medium">{t.about}</Link>
        </div>
      )}
    </nav>
  );
}
