"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { useCartStore } from "@/store/cartStore";

interface CartT {
  title: string;
  close: string;
  empty: string;
  browse: string;
  perPiece: string;
  remove: string;
  total: string;
  toCheckout: string;
}

export default function CartPanel({ t, lang }: { t: CartT; lang: string }) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.set(panel, { x: "100%" });
      gsap.set(overlay, { display: "block", opacity: 0 });
      gsap.to(overlay, { opacity: 1, duration: 0.3 });
      gsap.to(panel, { x: 0, duration: 0.4, ease: "power3.out" });
    } else {
      document.body.style.overflow = "";
      gsap.to(overlay, { opacity: 0, duration: 0.3 });
      gsap.to(panel, {
        x: "100%",
        duration: 0.35,
        ease: "power3.in",
        onComplete: () => gsap.set(overlay, { display: "none" }),
      });
    }
  }, [isOpen]);

  const orderTotal = total();

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className="fixed inset-0 z-40 bg-[#0D1321]/60 hidden"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-[#FFEDDF] flex flex-col"
        style={{ transform: "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#86615C]/20">
          <h2 className="font-display text-xl font-bold text-[#0D1321]">{t.title}</h2>
          <button
            onClick={closeCart}
            className="p-2 text-[#86615C] hover:text-[#0D1321] transition-colors"
            aria-label={t.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <svg className="w-16 h-16 text-[#86615C]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <p className="text-[#86615C] font-medium">{t.empty}</p>
              <button onClick={closeCart}>
                <Link href={`/${lang}/products`} className="text-[#C5D86D] text-sm font-semibold underline underline-offset-2">
                  {t.browse}
                </Link>
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#86615C]/10">
              {items.map((item) => (
                <li key={item.product.id} className="py-5 flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-[#86615C]/10">
                    <Image
                      src={item.product.img}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-[#0D1321] text-sm leading-snug mb-1">
                      {item.product.name}
                    </p>
                    <p className="text-[#86615C] text-xs mb-3">{item.product.price} € {t.perPiece}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#86615C]/30">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#86615C] hover:text-[#0D1321] transition-colors"
                        >−</button>
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-medium text-[#0D1321]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#86615C] hover:text-[#0D1321] transition-colors"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-xs text-[#86615C] hover:text-red-600 transition-colors underline underline-offset-2"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                  <p className="font-display font-bold text-[#0D1321] text-sm">
                    {item.product.price * item.quantity} €
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-[#86615C]/20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#86615C] font-medium">{t.total}</span>
              <span className="font-display text-2xl font-bold text-[#0D1321]">{orderTotal} €</span>
            </div>
            <Link
              href={`/${lang}/checkout`}
              onClick={closeCart}
              className="block w-full bg-[#0D1321] text-[#FFEDDF] text-center py-4 font-semibold text-sm tracking-wide hover:bg-[#C5D86D] hover:text-[#0D1321] transition-colors"
            >
              {t.toCheckout}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
