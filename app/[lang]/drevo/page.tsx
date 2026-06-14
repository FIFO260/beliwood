import { getDictionary } from "@/lib/i18n";
import { getWoodProducts } from "@/lib/db";
import DrevoClient from "./DrevoClient";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";

export const dynamic = "force-dynamic";

export default async function DrevoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const [woodProducts, dict] = await Promise.all([getWoodProducts(), getDictionary(lang)]);
  return (
    <DrevoClient
      woodProducts={woodProducts}
      t={dict.wood}
      labels={{
        species: dict.labels.species,
        states: dict.labels.states,
        surfaces: dict.labels.surfaces,
        view: dict.labels.view,
        viewDetail: dict.labels.viewDetail,
      }}
      lang={lang}
    />
  );
}
