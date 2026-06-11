"use client";

import { useEffect, useRef } from "react";
import { gsap, setupGsap, prefersReducedMotion } from "./gsap";

/**
 * Vlastný kurzor: presná bodka + lenivý krúžok. Stavy cez markup:
 *   data-cursor="drag"          — krúžok narastie, zobrazí šípky
 *   data-cursor="view"          — krúžok narastie, zobrazí label
 *   data-cursor-label="Pozrieť" — text v krúžku
 * Interaktívne prvky (a, button, input…) krúžok zväčšia automaticky.
 * Aktivuje sa len na zariadeniach s presným pointerom.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    setupGsap();
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;

    document.documentElement.classList.add("fx-cursor");

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    let visible = false;
    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25 });
    };

    const setMode = (mode: string | null, text: string | null) => {
      // plný limetkový krúžok s textom sa nesmie blendovať
      ring.classList.toggle("mix-blend-difference", !(mode === "drag" || mode === "view"));
      if (mode === "drag" || mode === "view") {
        label.textContent = mode === "drag" ? "⟵ ⟶" : text ?? "";
        gsap.to(ring, { scale: 2.6, backgroundColor: "rgba(197,216,109,0.95)", borderColor: "transparent", duration: 0.35 });
        gsap.to(label, { autoAlpha: 1, duration: 0.25 });
        gsap.to(dot, { scale: 0, duration: 0.25 });
      } else if (mode === "link") {
        gsap.to(ring, { scale: 1.7, backgroundColor: "rgba(255,255,255,0)", borderColor: "rgba(255,255,255,0.9)", duration: 0.3 });
        gsap.to(label, { autoAlpha: 0, duration: 0.2 });
        gsap.to(dot, { scale: 0.5, duration: 0.25 });
      } else {
        gsap.to(ring, { scale: 1, backgroundColor: "rgba(255,255,255,0)", borderColor: "rgba(255,255,255,0.55)", duration: 0.3 });
        gsap.to(label, { autoAlpha: 0, duration: 0.2 });
        gsap.to(dot, { scale: 1, duration: 0.25 });
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      if (tagged) {
        setMode(tagged.dataset.cursor ?? null, tagged.dataset.cursorLabel ?? null);
        return;
      }
      if (t.closest("a, button, [role='button'], input, textarea, select, label")) {
        setMode("link", null);
        return;
      }
      setMode(null, null);
    };

    const onDown = () => gsap.to(ring, { scale: "-=0.25", duration: 0.15 });
    const onUp = () => gsap.to(ring, { scale: "+=0.25", duration: 0.3, ease: "back.out(3)" });

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.documentElement.classList.remove("fx-cursor");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[110] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white opacity-0 mix-blend-difference"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[109] -ml-[18px] -mt-[18px] flex h-9 w-9 items-center justify-center rounded-full border border-white/55 opacity-0 mix-blend-difference"
      >
        <span
          ref={labelRef}
          className="select-none text-[8px] font-semibold uppercase tracking-widest text-[#0D1321] opacity-0"
        >
        </span>
      </div>
    </>
  );
}
