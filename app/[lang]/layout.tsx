import { getDictionary } from "@/lib/i18n";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartPanel from "@/components/Cart";
import LangSetter from "@/components/LangSetter";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const dict = await getDictionary(lang);

  return (
    <>
      <LangSetter lang={lang} />
      <Navbar t={dict.nav} lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer t={dict.footer} lang={lang} />
      <CartPanel t={dict.cart} lang={lang} />
    </>
  );
}
