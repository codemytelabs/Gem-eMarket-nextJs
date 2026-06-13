export const categories = [
  {
    id: "gems",
    name: "Gems",
    subcategories: [
      { id: "all", name: "All Gems", href: "/gems" },
      {
        id: "blue_sapphire",
        name: "Blue Sapphire",
        href: "/gems?type=blue-sapphire",
      },
      {
        id: "yellow_sapphire",
        name: "Yellow Sapphire",
        href: "/gems?type=yellow-sapphire",
      },
      {
        id: "white_sapphire",
        name: "White Sapphire",
        href: "/gems?type=white-sapphire",
      },
      {
        id: "padparadscha_sapphire",
        name: "Padparadscha Sapphire",
        href: "/gems?type=padparadscha-sapphire",
      },
      { id: "ruby", name: "Ruby", href: "/gems?type=ruby" },
      { id: "catseye", name: "Cat&apos;s Eye", href: "/gems?type=catseye" },
      { id: "spinel", name: "Spinel", href: "/gems?type=spinel" },
      { id: "other-gems", name: "Other Gems", href: "/gems?type=other" },
    ],
  },
  {
    id: "precious-metals",
    name: "Precious Metals",
    subcategories: [
      { id: "all", name: "All Metals", href: "/precious-metals" },
      { id: "gold", name: "Gold", href: "/precious-metals?type=gold" },
      { id: "silver", name: "Silver", href: "/precious-metals?type=silver" },
      {
        id: "platinum",
        name: "Platinum",
        href: "/precious-metals?type=platinum",
      },
      {
        id: "palladium",
        name: "Palladium",
        href: "/precious-metals?type=palladium",
      },
      {
        id: "other-metals",
        name: "Other",
        href: "/precious-metals?type=other",
      },
    ],
  },
  {
    id: "jewellery",
    name: "Jewellery",
    subcategories: [
      { id: "all", name: "All Jewellery", href: "/jewellery" },
      { id: "rings", name: "Rings", href: "/jewellery?type=rings" },
      { id: "necklaces", name: "Necklaces", href: "/jewellery?type=necklaces" },
      { id: "earrings", name: "Earrings", href: "/jewellery?type=earrings" },
      { id: "bracelets", name: "Bracelets", href: "/jewellery?type=bracelets" },
      { id: "pendants", name: "Pendants", href: "/jewellery?type=pendants" },
      {
        id: "wedding_sets",
        name: "Wedding & Engagement Sets",
        href: "/jewellery?type=wedding-sets",
      },
      { id: "other", name: "Other Jewellery", href: "/jewellery?type=other" },
    ],
  },
  {
    id: "services",
    name: "Services",
    subcategories: [
      { id: "all", name: "All Services", href: "/services" },
      {
        id: "certification",
        name: "Gem Certification",
        href: "/services?type=certification",
      },
      {
        id: "valuation",
        name: "Gem & Jewellery Valuation",
        href: "/services?type=valuation",
      },
      {
        id: "custom_design",
        name: "Custom Jewellery Design",
        href: "/services?type=custom-design",
      },
      {
        id: "repair",
        name: "Jewellery Repair & Polishing",
        href: "/services?type=repair",
      },
      { id: "engraving", name: "Engraving", href: "/services?type=engraving" },
      {
        id: "buying_consultation",
        name: "Buying Consultation",
        href: "/services?type=consultation",
      },
      {
        id: "training",
        name: "Gemology Training",
        href: "/services?type=training",
      },
      {
        id: "mining_tours",
        name: "Gem Mine Tours",
        href: "/services?type=tours",
      },
      { id: "other", name: "Other Services", href: "/services?type=other" },
    ],
  },
  {
    id: "sellers",
    name: "Sellers",
    subcategories: [
      { id: "all", name: "All Sellers", href: "/sellers" },
      { id: "shops", name: "Shops & Dealers", href: "/sellers?type=shops" },
      {
        id: "certifiers",
        name: "Gem Certificate Providers",
        href: "/sellers?type=certifiers",
      },
      {
        id: "jewellers",
        name: "Jewellery Designers & Makers",
        href: "/sellers?type=jewellers",
      },
      { id: "premium", name: "Premium Sellers", href: "/sellers?type=premium" },
      { id: "new", name: "Become a Seller", href: "/sell" },
    ],
  },
];

export const featuredLinks = [
  {
    title: "Special Deals",
    items: [
      { name: "Daily Deals", href: "/deals/daily" },
      { name: "Clearance", href: "/deals/clearance" },
      { name: "Bundle Offers", href: "/deals/bundles" },
    ],
  },
  {
    title: "Top Ranked",
    items: [
      { name: "Best Sellers", href: "/ranked/best-sellers" },
      { name: "Top Rated", href: "/ranked/top-rated" },
      { name: "Most Popular", href: "/ranked/popular" },
    ],
  },
  {
    title: "New Arrivals",
    items: [
      { name: "Latest Products", href: "/new/latest" },
      { name: "Upcoming Releases", href: "/new/upcoming" },
      { name: "Seasonal Items", href: "/new/seasonal" },
    ],
  },
];
