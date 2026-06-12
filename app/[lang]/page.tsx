import { getDictionary } from "@/lib/i18n";
import { getProducts, getWoodProducts } from "@/lib/db";
import HomeClient from "@/components/HomeClient";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const [products, woodProducts, dict] = await Promise.all([
    getProducts(),
    getWoodProducts(),
    getDictionary(lang),
  ]);
  return <HomeClient products={products} woodProducts={woodProducts} dict={dict} lang={lang} />;
}
