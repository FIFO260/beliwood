"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { gsap, setupGsap } from "@/components/fx/gsap";
import { getSmoother } from "@/components/fx/SmoothScroll";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  const badgeRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const lastScrollY = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) =>
    path === `/${lang}` || path === `/${lang}/`
      ? pathname === `/${lang}` || pathname === `/${lang}/`
      : pathname.startsWith(path);

  const navClass = (path: string) =>
    `link-line text-sm font-medium transition-colors ${
      isActive(path) ? "is-active text-[#C5D86D]" : "text-[#FFEDDF]/70 hover:text-[#FFEDDF]"
    }`;

  // skry pri scrolle dole, ukáž pri scrolle hore + scrolled pozadie
  useEffect(() => {
    setupGsap();
    const nav = navRef.current;
    if (!nav) return;

    const updateNavH = () => {
      const pct = (gsap.getProperty(nav, "yPercent") as number) || 0;
      const h = Math.max(0, 64 * (1 + pct / 100));
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 40);
      if (currentY > lastScrollY.current && currentY > 120) {
        gsap.to(nav, { yPercent: -100, duration: 0.4, ease: "beli", onUpdate: updateNavH });
      } else {
        gsap.to(nav, { yPercent: 0, duration: 0.4, ease: "beli", onUpdate: updateNavH });
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // pop badge-u pri zmene počtu kusov
  const itemCount = count();
  useEffect(() => {
    if (itemCount > 0 && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.3 },
        { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.5)" },
      );
    }
  }, [itemCount]);

  // fullscreen mobilné menu
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    setupGsap();
    const links = menu.querySelectorAll(".m-link");
    const meta = menu.querySelectorAll(".m-meta");
    menuTl.current = gsap
      .timeline({ paused: true })
      .set(menu, { pointerEvents: "auto" })
      .to(menu, { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "beli" })
      .from(links, { yPercent: 120, duration: 0.7, ease: "beli", stagger: 0.07 }, "-=0.3")
      .from(meta, { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.08 }, "-=0.4");
    return () => {
      menuTl.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!menuTl.current) return;
    if (menuOpen) {
      menuTl.current.timeScale(1).play();
      getSmoother()?.paused(true);
    } else {
      menuTl.current.timeScale(1.6).reverse();
      getSmoother()?.paused(false);
    }
  }, [menuOpen]);

  // zavri menu pri navigácii
  useEffect(() => {
    const id = requestAnimationFrame(() => setMenuOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const scrollToAbout = (e: React.MouseEvent) => {
    const smoother = getSmoother();
    const target = document.querySelector("#about");
    if (smoother && target && (pathname === `/${lang}` || pathname === `/${lang}/`)) {
      e.preventDefault();
      smoother.scrollTo(target, true, "top 100px");
      setMenuOpen(false);
    }
  };

  const links = [
    { href: `/${lang}/`, label: t.home, path: `/${lang}` },
    { href: `/${lang}/drevo`, label: t.wood, path: `/${lang}/drevo` },
    { href: `/${lang}/kolekcia`, label: t.kolekcia, path: `/${lang}/kolekcia` },
    { href: `/${lang}/products`, label: t.furniture, path: `/${lang}/products` },
  ];

  // priehľadný navbar len tam, kde stránka začína tmavou sekciou
  const normalized = pathname.replace(/\/+$/, "");
  const darkTop = [
    `/${lang}`,
    `/${lang}/drevo`,
    `/${lang}/products`,
    `/${lang}/kolekcia`,
    `/${lang}/checkout`,
  ].includes(normalized);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed left-0 right-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || menuOpen || !darkTop
            ? "border-b border-[#FFEDDF]/10 bg-[#0D1321]/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href={`/${lang}/`} className="relative z-50 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BeliWood" style={{ height: 36, width: 120 }} />
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <Link key={l.path} href={l.href} className={navClass(l.path)}>
                {l.label}
              </Link>
            ))}
            <Link
              href={`/${lang}/#about`}
              onClick={scrollToAbout}
              className="link-line text-sm font-medium text-[#FFEDDF]/70 transition-colors hover:text-[#FFEDDF]"
            >
              {t.about}
            </Link>
          </div>

          <div className="relative z-50 flex items-center gap-4">
            <LanguageSwitcher currentLang={lang} />

            <button
              onClick={openCart}
              className="relative p-2 text-[#FFEDDF] transition-colors hover:text-[#C5D86D]"
              aria-label={t.cartLabel}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span
                  ref={badgeRef}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5D86D] text-xs font-bold leading-none text-[#0D1321]"
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              className="group flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t.menuLabel}
              aria-expanded={menuOpen}
            >
              <span
                className={`h-px w-6 bg-[#FFEDDF] transition-transform duration-300 ${
                  menuOpen ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-6 bg-[#FFEDDF] transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen mobilné menu */}
      <div
        ref={menuRef}
        className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between bg-[#0D1321] px-8 pb-10 pt-28 md:hidden"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      >
        <nav className="flex flex-col gap-2">
          {[...links, { href: `/${lang}/#about`, label: t.about, path: "#about" }].map((l) => (
            <div key={l.path} className="overflow-hidden py-1">
              <Link
                href={l.href}
                onClick={(e) => {
                  if (l.path === "#about") scrollToAbout(e);
                  else setMenuOpen(false);
                }}
                className={`m-link block font-display text-5xl font-bold leading-tight ${
                  l.path !== "#about" && isActive(l.path) ? "text-[#C5D86D]" : "text-[#FFEDDF]"
                }`}
              >
                {l.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-end justify-between">
          <span className="m-meta font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFEDDF]/35">
            Beliwood — Slovensko
          </span>
          <a
            href="mailto:stolybeliwood@gmail.com"
            className="m-meta text-sm text-[#C5D86D]"
          >
            stolybeliwood@gmail.com
          </a>
        </div>
      </div>
    </>
  );
}
