import { getDictionary } from "@/lib/i18n";
import { getProducts } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const [products, dict] = await Promise.all([getProducts(), getDictionary(lang)]);
  const product = products.find((p) => p.id === parseInt(id)) ?? null;
  const related = product
    ? products
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, 3)
    : [];

  return (
    <ProductDetailClient
      product={product}
      related={related}
      t={dict.detail}
      categoryLabels={dict.labels.productCategories}
      lang={lang}
    />
  );
}
