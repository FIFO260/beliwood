import { getDictionary } from "@/lib/i18n";
import { getProducts } from "@/lib/db";
import ProductsClient from "./ProductsClient";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";

export default async function ProductsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const [products, dict] = await Promise.all([getProducts(), getDictionary(lang)]);
  return <ProductsClient products={products} t={dict.products} lang={lang} />;
}
