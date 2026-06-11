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
    const tween = gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y: 32 },
      { autoAlpha: 1, y: 0, duration: 0.85, ease: "beli", clearProps: "all" },
    );
    return () => {
      tween.kill();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
