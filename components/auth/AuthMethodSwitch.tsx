"use client";

import { useTranslations } from "next-intl";
import { colors } from "@/lib/theme/colors";

interface AuthMethodSwitchProps {
  value: "email" | "phone";
  onChange: (value: "email" | "phone") => void;
  disabled?: boolean;
}

export function AuthMethodSwitch({
  value,
  onChange,
  disabled = false,
}: AuthMethodSwitchProps) {
  const t = useTranslations("auth.common");
  const options: { key: "email" | "phone"; label: string }[] = [
    { key: "email", label: t("email") },
    { key: "phone", label: t("phone") },
  ];

  return (
    <div
      role="tablist"
      aria-label={t("signInMethodLabel")}
      className="inline-flex w-full rounded-lg border border-gray-300 bg-gray-50 p-1"
    >
      {options.map((option) => {
        const active = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(option.key)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={active ? { color: colors.primary.main } : undefined}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
