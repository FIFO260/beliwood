"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, setupGsap } from "@/components/fx/gsap";
import { wireReveals } from "@/components/fx/reveal";
import Magnetic from "@/components/fx/Magnetic";

interface FooterT {
  tagline: string;
  navTitle: string;
  home: string;
  products: string;
  about: string;
  order: string;
  contactTitle: string;
  rights: string;
  bottomTag: string;
  privacy: string;
}

export default function Footer({ t, lang }: { t: FooterT; lang: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setupGsap();
    const ctx = gsap.context(() => {
      wireReveals(ref.current!);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={ref}
      className="bg-[#0D1321] px-6 pb-10 pt-24 text-[#FFEDDF]/60"
    >
      <div className="mx-auto max-w-7xl">
        {/* Veľké CTA */}
        <div className="mb-20 border-b border-[#FFEDDF]/10 pb-16">
          <p
            className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#C5D86D]"
            data-reveal="fade"
          >
            {t.contactTitle}
          </p>
          <Magnetic strength={0.12} className="block w-fit max-w-full">
            <a
              href="mailto:info@beliwood.sk"
              className="group block w-fit max-w-full"
              data-reveal="lines"
            >
              <span className="font-display text-3xl font-bold leading-tight text-[#FFEDDF] transition-colors duration-300 group-hover:text-[#C5D86D] sm:text-5xl md:text-7xl break-all sm:break-normal">
                info<em className="italic text-[#C5D86D]">@</em>
                beliwood.sk
              </span>
              <span className="mt-4 block h-px w-full origin-left scale-x-0 bg-[#C5D86D] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100" />
            </a>
          </Magnetic>
        </div>

        <div
          className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3"
          data-reveal="fade"
          data-children
          data-stagger="0.1"
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="BeliWood"
              style={{ height: 28, width: 99 }}
              className="mb-4"
            />
            <p className="max-w-xs text-sm leading-relaxed">{t.tagline}</p>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#FFEDDF]">
              {t.navTitle}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={`/${lang}/`}
                  className="link-line transition-colors hover:text-[#C5D86D]"
                >
                  {t.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/products`}
                  className="link-line transition-colors hover:text-[#C5D86D]"
                >
                  {t.products}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/#about`}
                  className="link-line transition-colors hover:text-[#C5D86D]"
                >
                  {t.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/checkout`}
                  className="link-line transition-colors hover:text-[#C5D86D]"
                >
                  {t.order}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#FFEDDF]">
              {t.contactTitle}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:info@beliwood.sk"
                  className="link-line transition-colors hover:text-[#C5D86D]"
                >
                  info@beliwood.sk
                </a>
              </li>
              <li>+421 901 700 854</li>
              <li>Slovenská republika</li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 border-t border-[#FFEDDF]/10 pt-8 text-xs md:flex-row"
          data-reveal="fade"
        >
          <p>
            © {new Date().getFullYear()} BeliWood. {t.rights}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href={`/${lang}/gdpr`}
              className="transition-colors hover:text-[#C5D86D]"
            >
              {t.privacy}
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
              {t.bottomTag}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
