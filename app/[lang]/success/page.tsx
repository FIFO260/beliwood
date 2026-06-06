import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";

export default async function SuccessPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const dict = await getDictionary(lang);
  const t = dict.success;

  return (
    <div className="min-h-screen bg-[#0D1321] flex items-center justify-center px-6 pt-16">
      <div className="text-center max-w-xl">
        {/* Icon */}
        <div className="w-20 h-20 bg-[#C5D86D] rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-[#0D1321]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-[#C5D86D] text-xs font-semibold tracking-[0.3em] uppercase mb-4">{t.badge}</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FFEDDF] mb-6">
          {t.title}
        </h1>
        <p className="text-[#FFEDDF]/60 text-lg leading-relaxed mb-4">
          {t.sub}
        </p>
        <p className="text-[#FFEDDF]/40 text-sm mb-12">
          {t.email}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${lang}/products`}
            className="inline-flex items-center justify-center gap-2 bg-[#C5D86D] text-[#0D1321] px-8 py-4 font-semibold text-sm tracking-wide hover:bg-[#d4e87c] transition-colors"
          >
            {t.continue}
          </Link>
          <Link
            href={`/${lang}/`}
            className="inline-flex items-center justify-center border border-[#FFEDDF]/20 text-[#FFEDDF]/70 px-8 py-4 font-medium text-sm hover:border-[#C5D86D] hover:text-[#C5D86D] transition-colors"
          >
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
