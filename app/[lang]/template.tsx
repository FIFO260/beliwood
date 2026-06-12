"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, setupGsap, prefersReducedMotion } from "@/components/fx/gsap";

let firstLoad = true;

/** Jemný vstup obsahu pri navigácii medzi stránkami. */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // prvý load rieši preloader, netreba duplicitnú animáciu
    if (firstLoad) {
      firstLoad = false;
      return;
    }
    if (prefersReducedMotion()) return;
    setupGsap();
    // pozor: žiadne autoAlpha — visibility:hidden by sa dedilo na deti
    // a GSAP tweens vnútri stránky by si zachytili štart ako alpha 0
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.85, ease: "beli", clearProps: "all" },
    );
    return () => {
      tween.kill();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
