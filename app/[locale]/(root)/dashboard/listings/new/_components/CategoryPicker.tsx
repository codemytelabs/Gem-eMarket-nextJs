"use client";

import { Gem, Crown, Coins, Wrench } from "lucide-react";
import { LISTING_CATEGORY } from "@/types/enums";

const CATEGORIES = [
  {
    value: LISTING_CATEGORY.GEM,
    label: "Gemstone",
    description:
      "Loose certified or uncertified sapphires, rubies, and other gems.",
    icon: Gem,
    ring: "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    iconWrap: "bg-blue-50 dark:bg-blue-900/30 text-blue-600",
  },
  {
    value: LISTING_CATEGORY.JEWELLERY,
    label: "Jewellery",
    description: "Rings, necklaces, bracelets, and other finished pieces.",
    icon: Crown,
    ring: "hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    iconWrap: "bg-purple-50 dark:bg-purple-900/30 text-purple-600",
  },
  {
    value: LISTING_CATEGORY.PRECIOUS_METAL,
    label: "Precious Metal",
    description: "Gold, silver, platinum, or palladium bars, coins, or scrap.",
    icon: Coins,
    ring: "hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
    iconWrap: "bg-amber-50 dark:bg-amber-900/30 text-amber-600",
  },
  {
    value: LISTING_CATEGORY.SERVICE,
    label: "Service",
    description:
      "Gem cutting, certification, appraisal, repair, or design services.",
    icon: Wrench,
    ring: "hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
    iconWrap: "bg-green-50 dark:bg-green-900/30 text-green-600",
  },
];

interface CategoryPickerProps {
  onSelect: (category: LISTING_CATEGORY) => void;
}

export function CategoryPicker({ onSelect }: CategoryPickerProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        What are you listing?
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose a category to continue. Each category has its own fields.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onSelect(c.value)}
            className={`text-left p-5 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors ${c.ring}`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.iconWrap}`}
            >
              <c.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {c.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {c.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
