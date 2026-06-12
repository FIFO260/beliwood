"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from "gsap/Observer";

let registered = false;

/** Jednotná registrácia pluginov + podpisový easing celej stránky. */
export function setupGsap() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText, CustomEase, Observer);
  ScrollTrigger.config({ ignoreMobileResize: true });
  CustomEase.create("beli", "0.76, 0, 0.24, 1");
  CustomEase.create("beli-out", "0.16, 1, 0.3, 1");
  gsap.defaults({ ease: "beli-out", duration: 0.9 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Observer };
