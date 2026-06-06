import { getDictionary } from "@/lib/i18n";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";
import OrderForm from "@/components/OrderForm";

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const dict = await getDictionary(lang);
  return (
    <div className="min-h-screen bg-[#FFEDDF] pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase mb-3">{dict.checkout.badge}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0D1321]">{dict.checkout.title}</h1>
        </div>
        <OrderForm />
      </div>
    </div>
  );
}
