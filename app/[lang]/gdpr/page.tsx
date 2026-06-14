import { getDictionary } from "@/lib/i18n";
import { locales, defaultLocale, type Locale } from "@/lib/i18n-config";
import Link from "next/link";

export default async function GdprPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : defaultLocale;
  const dict = await getDictionary(lang);
  const t = dict.privacy;

  const sections = [
    { h: t.s1h, p: t.s1p },
    { h: t.s2h, p: t.s2p, list: t.s2list },
    { h: t.s3h, p: t.s3p },
    { h: t.s4h, p: t.s4p },
    { h: t.s5h, p: t.s5p, list: t.s5list, end: t.s5end },
    { h: t.s6h, p: t.s6p, list: t.s6list, end: t.s6end },
    { h: t.s7h, p: t.s7p },
    { h: t.s8h, p: t.s8p },
  ];

  return (
    <main className="min-h-screen bg-[#0D1321] px-6 pb-24 pt-32 text-[#FFEDDF]">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${lang}/`}
          className="mb-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#FFEDDF]/40 transition-colors hover:text-[#C5D86D]"
        >
          ← BeliWood
        </Link>

        <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">{t.title}</h1>
        <p className="mb-12 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FFEDDF]/40">
          {t.updated}
        </p>

        <p className="mb-12 text-sm leading-relaxed text-[#FFEDDF]/70">{t.intro}</p>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={i} className="border-t border-[#FFEDDF]/10 pt-8">
              <h2 className="mb-4 text-lg font-semibold text-[#C5D86D]">{s.h}</h2>
              {s.p.split("\n\n").map((para, j) => (
                <p key={j} className="mb-3 whitespace-pre-line text-sm leading-relaxed text-[#FFEDDF]/70">
                  {para}
                </p>
              ))}
              {s.list && (
                <ul className="mb-3 space-y-2 pl-4">
                  {s.list.split("|").map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm leading-relaxed text-[#FFEDDF]/70">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#C5D86D]" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {s.end && (
                <p className="mt-3 text-sm leading-relaxed text-[#FFEDDF]/70">{s.end}</p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-[#FFEDDF]/10 pt-8">
          <p className="text-xs text-[#FFEDDF]/30">© {new Date().getFullYear()} BeliWood</p>
        </div>
      </div>
    </main>
  );
}
