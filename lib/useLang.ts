"use client";
import { usePathname } from "next/navigation";
import { locales, defaultLocale } from "./i18n-config";

export function useLang(): string {
  const pathname = usePathname();
  const segment = pathname?.split("/")[1] ?? "";
  return (locales as readonly string[]).includes(segment) ? segment : defaultLocale;
}
