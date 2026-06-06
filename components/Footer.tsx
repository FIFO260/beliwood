import Link from "next/link";

interface FooterT {
  tagline: string;
  navTitle: string;
  home: string;
  products: string;
  about: string;
  order: string;
  contactTitle: string;
  rights: string;
  bottomTag: string;
}

export default function Footer({ t, lang }: { t: FooterT; lang: string }) {
  return (
    <footer className="bg-[#0D1321] text-[#FFEDDF]/60 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="BeliWood" style={{ height: 28, width: 99 }} className="mb-4" />
            <p className="text-sm leading-relaxed max-w-xs">
              {t.tagline}
            </p>
          </div>

          <div>
            <h3 className="text-[#FFEDDF] font-semibold text-sm tracking-widest uppercase mb-5">{t.navTitle}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href={`/${lang}/`} className="hover:text-[#C5D86D] transition-colors">{t.home}</Link></li>
              <li><Link href={`/${lang}/products`} className="hover:text-[#C5D86D] transition-colors">{t.products}</Link></li>
              <li><Link href={`/${lang}/#about`} className="hover:text-[#C5D86D] transition-colors">{t.about}</Link></li>
              <li><Link href={`/${lang}/checkout`} className="hover:text-[#C5D86D] transition-colors">{t.order}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#FFEDDF] font-semibold text-sm tracking-widest uppercase mb-5">{t.contactTitle}</h3>
            <ul className="space-y-3 text-sm">
              <li>stolybeliwood@gmail.com</li>
              <li>+421 900 000 000</li>
              <li>Slovenská republika</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#FFEDDF]/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} BeliWood. {t.rights}</p>
          <p>{t.bottomTag}</p>
        </div>
      </div>
    </footer>
  );
}
