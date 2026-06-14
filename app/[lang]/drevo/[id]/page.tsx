import { getDictionary } from "@/lib/i18n";
import { getWoodProducts } from "@/lib/db";
import WoodDetailClient from "./WoodDetailClient";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";

export default async function WoodDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const [woodProducts, dict] = await Promise.all([getWoodProducts(), getDictionary(lang)]);
  const wood = woodProducts.find((w) => w.id === parseInt(id)) ?? null;
  const related = wood
    ? woodProducts.filter((w) => w.id !== wood.id && w.species === wood.species).slice(0, 3)
    : [];

  return (
    <WoodDetailClient
      wood={wood}
      related={related}
      t={dict.wood}
      detailT={dict.detail}
      navWood={dict.nav.wood}
      labels={{ species: dict.labels.species, states: dict.labels.states, surfaces: dict.labels.surfaces }}
      lang={lang}
    />
  );
}
