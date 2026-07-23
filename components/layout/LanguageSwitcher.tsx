"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: "English",
  ta: "தமிழ்",
  si: "සිංහල",
};

export default function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideClick([ref], () => setIsOpen(false));

  const selectLocale = (nextLocale: Locale) => {
    setIsOpen(false);
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium text-light-text hover:text-text transition-colors"
        aria-label={t("changeLanguage")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {LANGUAGE_LABELS[locale]}
        <ChevronDown
          className={`h-3.5 w-3.5 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden"
        >
          {routing.locales.map((code) => (
            <button
              key={code}
              role="option"
              aria-selected={code === locale}
              onClick={() => selectLocale(code)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-text hover:bg-background"
            >
              {LANGUAGE_LABELS[code]}
              {code === locale && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
