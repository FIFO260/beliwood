import { getDictionary } from "@/lib/i18n";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";
import { portfolioItems } from "@/lib/portfolio";
import KolekciaClient from "./KolekciaClient";

export default async function KolekciaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const dict = await getDictionary(lang);
  return <KolekciaClient items={portfolioItems} t={dict.kolekcia} />;
}
