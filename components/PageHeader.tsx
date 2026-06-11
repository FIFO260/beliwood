"use client";

import { useEffect, useRef } from "react";
import { gsap, setupGsap } from "@/components/fx/gsap";
import { wireReveals } from "@/components/fx/reveal";

/** Jednotná hlavička podstránok s reveal animáciami. */
export default function PageHeader({
  badge,
  title,
  sub,
}: {
  badge: string;
  title: string;
  sub?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleParts = title.split("\n");

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      wireReveals(ref.current!);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative overflow-hidden bg-[#0D1321] px-6 pb-16 pt-36 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <p
          className="mb-4 flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C5D86D]"
          data-reveal="fade"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C5D86D]" />
          {badge}
        </p>
        <h1
          className="mb-5 font-display text-5xl font-bold leading-[1.02] text-[#FFEDDF] md:text-7xl"
          data-reveal="chars"
          data-stagger="0.012"
        >
          {titleParts[0]}
          {titleParts[1] && <><br />{titleParts[1]}</>}
        </h1>
        {sub && (
          <p className="max-w-2xl text-lg text-[#FFEDDF]/50" data-reveal="fade" data-delay="0.25">
            {sub}
          </p>
        )}
        <div className="mt-10 h-px w-full bg-[#FFEDDF]/10" data-reveal="draw" data-delay="0.3" />
      </div>
    </div>
  );
}
