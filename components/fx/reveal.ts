"use client";

import { gsap, SplitText, prefersReducedMotion } from "./gsap";

/**
 * Deklaratívne scroll-reveal animácie. V markupe stačí data atribút,
 * komponent zavolá wireReveals(scope) vo svojom gsap.context:
 *
 *   data-reveal="lines"  — text po riadkoch spoza masky (SplitText)
 *   data-reveal="chars"  — nadpis po znakoch
 *   data-reveal="fade"   — posun hore + fade (deti cez data-stagger)
 *   data-reveal="clip"   — obrázok spoza clip-path opony
 *   data-reveal="draw"   — čiara/divider sa nakreslí (scaleX)
 *
 * Voliteľné: data-delay="0.2", data-stagger="0.1", data-start="top 80%"
 */
export function wireReveals(scope: HTMLElement) {
  if (prefersReducedMotion()) return;

  const num = (el: Element, name: string, fallback: number) => {
    const v = parseFloat(el.getAttribute(name) ?? "");
    return Number.isFinite(v) ? v : fallback;
  };
  const start = (el: Element) => el.getAttribute("data-start") ?? "top 85%";

  scope.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (split) =>
        gsap.from(split.lines, {
          yPercent: 115,
          duration: 1.1,
          ease: "beli",
          stagger: num(el, "data-stagger", 0.09),
          delay: num(el, "data-delay", 0),
          scrollTrigger: { trigger: el, start: start(el), once: true },
        }),
    });
  });

  scope.querySelectorAll<HTMLElement>('[data-reveal="chars"]').forEach((el) => {
    SplitText.create(el, {
      type: "chars,lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (split) =>
        gsap.from(split.chars, {
          yPercent: 110,
          duration: 0.9,
          ease: "beli",
          stagger: num(el, "data-stagger", 0.018),
          delay: num(el, "data-delay", 0),
          scrollTrigger: { trigger: el, start: start(el), once: true },
        }),
    });
  });

  scope.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    const targets = el.hasAttribute("data-children")
      ? Array.from(el.children)
      : [el];
    gsap.from(targets, {
      y: 36,
      autoAlpha: 0,
      duration: 1,
      stagger: num(el, "data-stagger", 0.12),
      delay: num(el, "data-delay", 0),
      scrollTrigger: { trigger: el, start: start(el), once: true },
    });
  });

  scope.querySelectorAll<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
    gsap.from(el, {
      clipPath: el.getAttribute("data-clip") ?? "inset(0 0 100% 0)",
      duration: 1.3,
      ease: "beli",
      delay: num(el, "data-delay", 0),
      scrollTrigger: { trigger: el, start: start(el), once: true },
    });
    const img = el.querySelector("img");
    if (img) {
      gsap.from(img, {
        scale: 1.25,
        duration: 1.6,
        ease: "beli",
        scrollTrigger: { trigger: el, start: start(el), once: true },
      });
    }
  });

  scope.querySelectorAll<HTMLElement>('[data-reveal="draw"]').forEach((el) => {
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 1.2,
      ease: "beli",
      delay: num(el, "data-delay", 0),
      scrollTrigger: { trigger: el, start: start(el), once: true },
    });
  });
}
