"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { setupGsap, ScrollTrigger, ScrollSmoother, prefersReducedMotion } from "./gsap";

declare global {
  interface Window {
    __smoother?: ScrollSmoother | null;
  }
}

/** Programový prístup k smooth scrollu (anchor linky a pod.). */
export const getSmoother = () =>
  (typeof window !== "undefined" && window.__smoother) || null;

/**
 * ScrollSmoother obal celej stránky. Fixné prvky (navbar, košík,
 * kurzor, preloader) musia žiť MIMO tohto wrappera.
 * data-speed / data-lag na prvkoch vo vnútri fungujú automaticky.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    setupGsap();
    if (prefersReducedMotion()) return;

    // GPU akcelerácia? Bez nej nechávame dekoratívne animácie (zrno) statické
    const probe = document.createElement("canvas");
    if (probe.getContext("webgl2") || probe.getContext("webgl")) {
      document.documentElement.classList.add("fx-anim");
    }

    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current!,
      content: contentRef.current!,
      smooth: 1,
      effects: true,
      smoothTouch: false,
      // normalizeScroll preberá celý scroll do JS — na desktope to pridáva
      // latenciu navyše; necháme natívny scroll a len ho doháňame
      normalizeScroll: false,
    });
    window.__smoother = smoother;

    return () => {
      smoother.kill();
      window.__smoother = null;
    };
  }, []);

  // Po navigácii hore + prepočet trigger pozícií pre novú výšku obsahu
  useLayoutEffect(() => {
    const id = window.setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target && window.__smoother) {
          ScrollTrigger.refresh();
          window.__smoother.scrollTo(target, false, "top 100px");
          return;
        }
      }
      window.__smoother?.scrollTop(0);
      ScrollTrigger.refresh();
    }, 60);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // refresh aj po dohraní obrázkov (menia výšku stránky)
  useLayoutEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content" className="flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
