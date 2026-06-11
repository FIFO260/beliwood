"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, setupGsap, prefersReducedMotion } from "./gsap";

export const PRELOADER_DONE_EVENT = "beli:ready";

/** Hero a iné vstupné animácie čakajú na koniec preloadera. */
export function onSiteReady(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (document.documentElement.classList.contains("is-ready")) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(PRELOADER_DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(PRELOADER_DONE_EVENT, handler);
}

const markReady = () => {
  document.documentElement.classList.add("is-ready");
  window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));
};

/**
 * Vstupná opona — raz za session: wordmark po znakoch, počítadlo,
 * potom sa opona zdvihne. Pri ďalších navigáciách sa nezobrazuje.
 */
export default function Preloader() {
  const [show, setShow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("beli-preloaded");
    if (seen || prefersReducedMotion()) {
      markReady();
      return;
    }
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!show) return;
    setupGsap();
    const root = rootRef.current!;
    const word = wordRef.current!;
    const pct = pctRef.current!;
    const line = lineRef.current!;
    const letters = Array.from(word.children);

    document.documentElement.classList.add("overflow-hidden");

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("beli-preloaded", "1");
        document.documentElement.classList.remove("overflow-hidden");
        markReady();
        setShow(false);
      },
    });

    tl.from(letters, { yPercent: 120, duration: 0.9, ease: "beli", stagger: 0.045 })
      .from(line, { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "beli" }, 0.2)
      .to(
        counter,
        {
          v: 100,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: () => {
            pct.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        },
        0.15,
      )
      .to(letters, { yPercent: -120, duration: 0.7, ease: "beli", stagger: 0.03 }, "+=0.15")
      .to([pct, line], { autoAlpha: 0, duration: 0.4 }, "<")
      .to(root, { yPercent: -100, duration: 0.9, ease: "beli" }, "-=0.35");

    return () => {
      tl.kill();
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#0D1321]"
      aria-hidden
    >
      <div className="overflow-hidden">
        <div ref={wordRef} className="flex font-display text-5xl font-bold text-[#FFEDDF] md:text-7xl">
          {"BeliWood".split("").map((ch, i) => (
            <span key={i} className={ch === "W" || ch === "o" || ch === "d" ? "text-[#C5D86D]" : ""}>
              {ch}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex w-56 items-center gap-4 md:w-72">
        <div ref={lineRef} className="h-px flex-1 bg-[#FFEDDF]/25" />
        <span ref={pctRef} className="font-mono text-xs tracking-widest text-[#C5D86D]">
          000
        </span>
      </div>
    </div>
  );
}
