"use client";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/lib/i18n-config";

const labels: Record<string, string> = { sk: "SK", en: "EN", de: "DE", pl: "PL" };

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLang = (lang: string) => {
    const segments = pathname.split("/");
    segments[1] = lang;
    router.push(segments.join("/") || "/");
  };

  return (
    <div className="flex items-center gap-0.5">
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          <button
            onClick={() => switchLang(locale)}
            className={`text-[10px] font-bold tracking-widest transition-colors px-1 py-0.5 ${
              currentLang === locale
                ? "text-[#C5D86D]"
                : "text-[#FFEDDF]/30 hover:text-[#FFEDDF]/60"
            }`}
          >
            {labels[locale]}
          </button>
          {i < locales.length - 1 && (
            <span className="text-[#FFEDDF]/20 text-[10px]">·</span>
          )}
        </span>
      ))}
    </div>
  );
}
