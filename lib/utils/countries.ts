import { countries } from "countries-list";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
}

// Sri Lanka first, then all others alphabetically
export const COUNTRIES: Country[] = [
  { code: "LK", name: "Sri Lanka", dialCode: "+94" },
  ...Object.entries(countries)
    .filter(([code]) => code !== "LK")
    .map(([code, data]) => ({
      code,
      name: data.name,
      dialCode: `+${data.phone[0]}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getDialCode(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.dialCode ?? "";
}
