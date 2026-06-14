import { getDictionary } from "@/lib/i18n";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";
import { getPortfolioItems } from "@/lib/db";
import KolekciaClient from "./KolekciaClient";

export default async function KolekciaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const [items, dict] = await Promise.all([getPortfolioItems(), getDictionary(lang)]);
  return <KolekciaClient items={items} t={dict.kolekcia} speciesLabels={dict.labels.species} />;
}
