import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ta", "si"],
  defaultLocale: "en",
  // English also gets a visible /en/ prefix (not hidden) so all 3 languages
  // are indexable as distinct URLs — the whole point of this routing setup.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
