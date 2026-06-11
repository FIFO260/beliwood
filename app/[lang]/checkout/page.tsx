import { getDictionary } from "@/lib/i18n";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";
import OrderForm from "@/components/OrderForm";
import PageHeader from "@/components/PageHeader";

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const dict = await getDictionary(lang);
  return (
    <div className="min-h-screen bg-[#FFEDDF]">
      <PageHeader badge={dict.checkout.badge} title={dict.checkout.title} />
      <div className="max-w-7xl mx-auto px-6 py-14">
        <OrderForm />
      </div>
    </div>
  );
}
