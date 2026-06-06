"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

interface FormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  note: string;
}

export default function OrderForm() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", street: "", city: "", zip: "", note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, total: total() }),
      });

      if (!res.ok) throw new Error("Odoslanie zlyhalo");

      clearCart();
      router.push("/success");
    } catch {
      setError("Nastala chyba pri odoslaní objednávky. Skúste to znova.");
    } finally {
      setLoading(false);
    }
  };

  const orderTotal = total();

  const inputClass =
    "w-full border border-[#86615C]/30 bg-white px-4 py-3 text-[#0D1321] text-sm placeholder:text-[#86615C]/50 focus:outline-none focus:border-[#C5D86D] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left — contact fields */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#0D1321] mb-6">Kontaktné údaje</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86615C] tracking-widest uppercase mb-2">
                Meno a priezvisko *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ján Novák"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86615C] tracking-widest uppercase mb-2">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jan@example.sk"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#86615C] tracking-widest uppercase mb-2">
                  Telefón
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+421 900 000 000"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-[#0D1321] mb-6">Doručovacia adresa</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86615C] tracking-widest uppercase mb-2">
                Ulica a číslo *
              </label>
              <input
                name="street"
                value={form.street}
                onChange={handleChange}
                required
                placeholder="Hlavná 1"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#86615C] tracking-widest uppercase mb-2">
                  Mesto *
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="Bratislava"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#86615C] tracking-widest uppercase mb-2">
                  PSČ *
                </label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  required
                  placeholder="811 01"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86615C] tracking-widest uppercase mb-2">
            Poznámka k objednávke
          </label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={4}
            placeholder="Špeciálne požiadavky, termín dodania..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Right — order summary */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[#0D1321] mb-6">Zhrnutie objednávky</h2>
        <div className="bg-white border border-[#86615C]/20 p-6">
          {items.length === 0 ? (
            <p className="text-[#86615C] text-sm">Košík je prázdny.</p>
          ) : (
            <>
              <ul className="divide-y divide-[#86615C]/10 mb-6">
                {items.map((item) => (
                  <li key={item.product.id} className="py-4 flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-[#0D1321] text-sm leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-[#86615C] text-xs mt-0.5">
                        {item.quantity} × {item.product.price} €
                      </p>
                    </div>
                    <span className="font-semibold text-[#0D1321] text-sm flex-shrink-0">
                      {item.product.price * item.quantity} €
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-[#86615C]/20 pt-4 flex justify-between items-center mb-8">
                <span className="font-display font-bold text-[#0D1321] text-lg">Celkom</span>
                <span className="font-display font-bold text-[#0D1321] text-2xl">{orderTotal} €</span>
              </div>
            </>
          )}

          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full bg-[#0D1321] text-[#FFEDDF] py-4 font-semibold text-sm tracking-wide hover:bg-[#C5D86D] hover:text-[#0D1321] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Odosielam…" : "Odoslať objednávku"}
          </button>

          <p className="text-[#86615C] text-xs mt-4 text-center">
            Po odoslaní vás budeme kontaktovať na dohodnutie detailov a doručenia.
          </p>
        </div>
      </div>
    </form>
  );
}
