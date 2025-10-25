"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Coins,
  User,
  Search,
  Heart,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Globe,
  Bell,
  MessageCircle,
  Gem,
  Circle,
  Sparkles,
  Crown,
  Store,
  Settings,
  Plus,
} from "lucide-react";
import { colors } from "@/lib/theme/colors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories, featuredLinks } from "@/config/const/navLinks";
import { useThemeStore } from "@/store/themeStore";
import { useTheme } from "next-themes";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    "allCategories",
  );
  const [hoveredCategory, setHoveredCategory] = useState("pets");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { theme, setTheme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setActiveCategory(null);
        setShowSearchBar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toggleDarkMode();
    console.log(
      "zustand theme: ",
      toggleDarkMode,
      "ThemeProvider theme: ",
      theme,
    );
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Search for:", searchQuery);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCategory = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setShowSearchBar(false);
    } else {
      setActiveCategory(category);
      setShowSearchBar(true);
    }
  };

  const toggleMobileCategory = (categoryId: string) => {
    if (expandedMobileCategory === categoryId) {
      setExpandedMobileCategory(null);
    } else {
      setExpandedMobileCategory(categoryId);
    }
  };

  const handleCategoryHover = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(categoryId);
    }, 100);
  };

  // Category content mapping with images
  const categoryContent: Record<string, React.ReactNode> = {
    allCategories: (
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className="col-span-1 border-r pr-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`p-2 cursor-pointer rounded ${hoveredCategory === category.id ? (isDarkMode ? "bg-gray-700" : "bg-gray-100") : ""}`}
              onMouseEnter={() => handleCategoryHover(category.id)}
            >
              <span
                className={`font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                {category.name}
              </span>
            </div>
          ))}
        </div>

        <div className="col-span-4 pl-4">
          <h3
            className="font-bold text-lg mb-3"
            style={{ color: colors.primary.main }}
          >
            {categories.find((c) => c.id === hoveredCategory)?.name}
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {categories
              .find((c) => c.id === hoveredCategory)
              ?.subcategories.map((subcat) => {
                // Get appropriate icon for each category and subcategory
                const getCategoryIcon = (
                  categoryId: string,
                  subcatId: string,
                ) => {
                  // Special case for "New Sellers" - show big plus icon
                  if (categoryId === "sellers" && subcatId === "new") {
                    return (
                      <Plus
                        className="w-16 h-16"
                        style={{ color: colors.accent.features }}
                      />
                    );
                  }

                  // Regular category icons
                  switch (categoryId) {
                    case "gems":
                      return (
                        <Gem
                          className="w-12 h-12"
                          style={{ color: colors.primary.main }}
                        />
                      );
                    case "precious-metals":
                      return (
                        <Circle
                          className="w-12 h-12"
                          style={{ color: colors.secondary.main }}
                        />
                      );
                    case "jewellery":
                      return (
                        <Crown
                          className="w-12 h-12"
                          style={{ color: colors.accent.premium }}
                        />
                      );
                    case "services":
                      return (
                        <Settings
                          className="w-12 h-12"
                          style={{ color: colors.accent.features }}
                        />
                      );
                    case "sellers":
                      return (
                        <Store
                          className="w-12 h-12"
                          style={{ color: colors.primary.dark }}
                        />
                      );
                    default:
                      return (
                        <Sparkles
                          className="w-12 h-12"
                          style={{ color: colors.primary.main }}
                        />
                      );
                  }
                };

                return (
                  <div key={subcat.id} className="flex flex-col items-center">
                    <Link href={subcat.href} className="group">
                      <div
                        className={`mb-2 w-24 h-24 rounded-lg border-2 flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-600 group-hover:border-gray-500"
                            : "bg-gray-100 border-gray-300 group-hover:border-gray-400"
                        }`}
                      >
                        {getCategoryIcon(hoveredCategory, subcat.id)}
                      </div>
                    </Link>
                    <Link
                      href={subcat.href}
                      className={`text-center py-1 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-primary-600"}`}
                    >
                      {subcat.name}
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    ),

    featured: (
      <div className="grid grid-cols-3 gap-4 p-4">
        {featuredLinks.map((section, index) => (
          <div key={index} className="space-y-2">
            <h3 className="font-bold text-gray-900">{section.title}</h3>
            <ul className="space-y-1">
              {section.items.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-primary-600"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),

    priceRanges: (
      <div className="p-4 space-y-4">
        <h3 className="font-bold text-gray-900">Select Price Range</h3>
        <div className="grid grid-cols-4 gap-2">
          <Link
            href="#"
            className="block p-2 border rounded text-center hover:bg-gray-100"
          >
            Under $25
          </Link>
          <Link
            href="#"
            className="block p-2 border rounded text-center hover:bg-gray-100"
          >
            $25 - $50
          </Link>
          <Link
            href="#"
            className="block p-2 border rounded text-center hover:bg-gray-100"
          >
            $50 - $100
          </Link>
          <Link
            href="#"
            className="block p-2 border rounded text-center hover:bg-gray-100"
          >
            $100+
          </Link>
        </div>
        <div className="pt-2">
          <h4 className="font-medium text-gray-900 mb-2">Custom Range</h4>
          <div className="flex items-center space-x-4">
            <div className="w-24">
              <label className="block text-sm text-gray-600">Min</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="$0"
              />
            </div>
            <div className="text-gray-500">to</div>
            <div className="w-24">
              <label className="block text-sm text-gray-600">Max</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="$1000"
              />
            </div>
            <Button size="sm" className="mt-4" variant="primary">
              Apply
            </Button>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <nav
      className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} shadow-md transition-colors duration-300`}
    >
      {/* Top bar with logo, search, and utilities */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 relative mr-2">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.accent.features})`,
                  }}
                ></div>
                <div
                  className={`absolute inset-1 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-full flex items-center justify-center transition-colors duration-300`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={colors.primary.main}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <span
                className="font-bold text-xl"
                style={{
                  color: isDarkMode
                    ? colors.primary.light
                    : colors.primary.main,
                }}
              >
                PetPalace
              </span>
            </Link>
          </div>

          {/* Search bar - hidden on mobile and when no category selected */}
          {showSearchBar && (
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for pet products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="filled"
                    sizeVariant="md"
                    rightIcon={
                      <button type="submit">
                        <Search
                          className="h-5 w-5"
                          style={{ color: colors.primary.main }}
                        />
                      </button>
                    }
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right side navigation items - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="flex items-center">
              <Globe
                className={`h-5 w-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              />
              <select
                className={`ml-1 text-sm border-none ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
              >
                <option value="en-US">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={changeTheme}
              className={`p-1 rounded-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="flex items-center hover:text-gray-600 relative"
            >
              <Bell
                className="h-5 w-5"
                style={{ color: colors.secondary.main }}
              />
              <span
                className="absolute -top-2 -right-2 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: "red" }}
              >
                5
              </span>
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className="flex items-center hover:text-gray-600 relative"
            >
              <MessageCircle
                className="h-5 w-5"
                style={{ color: colors.secondary.main }}
              />
              <span
                className="absolute -top-2 -right-2 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: colors.accent.premium }}
              >
                2
              </span>
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="flex items-center hover:text-gray-600"
            >
              <Heart
                className="h-5 w-5"
                style={{ color: colors.accent.premium }}
              />
            </Link>

            {/* Coins Link (Replacing Cart) */}
            <Link
              href="/coins"
              className="flex items-center hover:text-gray-600 relative"
            >
              <Coins
                className="h-5 w-5"
                style={{ color: colors.secondary.main }}
              />
              <span
                className="absolute -top-2 -right-2 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: colors.accent.premium }}
              >
                3
              </span>
            </Link>

            {/* Sign In Button */}
            <Link href="/login">
              <Button
                variant="primary"
                size="md"
                leftIcon={<User className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Coins Icon for Mobile (replacing Cart) */}
            <Link href="/coins" className="relative">
              <Coins
                className="h-6 w-6"
                style={{
                  color: isDarkMode
                    ? colors.secondary.light
                    : colors.secondary.main,
                }}
              />
              <span
                className="absolute -top-2 -right-2 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: colors.accent.premium }}
              >
                3
              </span>
            </Link>

            {/* Dark Mode Toggle for Mobile */}
            <button onClick={toggleDarkMode} className="p-1">
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Menu Toggle Button */}
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md ${isDarkMode ? "text-white hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"} focus:outline-none`}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search - visible on mobile only */}
      <div className="md:hidden px-4 pb-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            type="text"
            placeholder="Search for pet products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant={isDarkMode ? "filled" : "default"}
            sizeVariant="md"
            fullWidth
            rightIcon={
              <button type="submit">
                <Search
                  className="h-5 w-5"
                  style={{ color: colors.primary.main }}
                />
              </button>
            }
          />
        </form>
      </div>

      {/* Categories menu */}
      <div
        className={`border-t ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"} transition-colors duration-300`}
        ref={categoryMenuRef}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden md:flex items-center py-2 relative">
            {/* Left aligned menu items */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => toggleCategory("allCategories")}
                className={`flex items-center whitespace-nowrap text-base font-medium ${
                  activeCategory === "allCategories"
                    ? `font-semibold ${isDarkMode ? "text-white" : "text-primary-600"}`
                    : `${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`
                }`}
              >
                All Categories
                <ChevronDown
                  className={`h-4 w-4 ml-1 transform ${activeCategory === "allCategories" ? "rotate-180" : ""}`}
                />
              </button>

              <button
                onClick={() => toggleCategory("featured")}
                className={`flex items-center whitespace-nowrap text-base font-medium ${
                  activeCategory === "featured"
                    ? `font-semibold ${isDarkMode ? "text-white" : "text-primary-600"}`
                    : `${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`
                }`}
              >
                Featured
                <ChevronDown
                  className={`h-4 w-4 ml-1 transform ${activeCategory === "featured" ? "rotate-180" : ""}`}
                />
              </button>

              <button
                onClick={() => toggleCategory("priceRanges")}
                className={`flex items-center whitespace-nowrap text-base font-medium ${
                  activeCategory === "priceRanges"
                    ? `font-semibold ${isDarkMode ? "text-white" : "text-primary-600"}`
                    : `${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`
                }`}
              >
                Price Ranges
                <ChevronDown
                  className={`h-4 w-4 ml-1 transform ${activeCategory === "priceRanges" ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Right aligned menu items */}
            <div className="ml-auto flex items-center space-x-8">
              <Link
                href="/about"
                className={`whitespace-nowrap text-base font-medium ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
              >
                About
              </Link>
              <Link
                href="/help-center/contact"
                className={`whitespace-nowrap text-base font-medium ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
              >
                Help Center
              </Link>
              <Link
                href="/sell"
                className={`whitespace-nowrap text-base font-medium ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
              >
                Sell
              </Link>
            </div>
          </div>

          {/* Dropdown menu content */}
          {activeCategory && (
            <div
              className={`absolute z-50 left-0 right-0 border-t border-b shadow-lg ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div className="max-w-7xl mx-auto">
                {categoryContent[activeCategory]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div
          className={`px-2 pt-2 pb-3 shadow-inner ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
        >
          {/* Mobile Category Navigation */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="mb-2">
                <button
                  onClick={() => toggleMobileCategory(category.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
                    expandedMobileCategory === category.id
                      ? isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-200"
                  } font-medium`}
                >
                  <span>{category.name}</span>
                  <ChevronDown
                    className={`h-4 w-4 transform ${expandedMobileCategory === category.id ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedMobileCategory === category.id && (
                  <div className="mt-1 ml-4 space-y-1">
                    {category.subcategories.map((subcat) => (
                      <Link
                        href={subcat.href}
                        key={subcat.id}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {subcat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Featured Links */}
          <div
            className={`border-t mt-3 pt-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <Link
              href="/featured"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              Featured
            </Link>
            <Link
              href="/deals"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              Deals
            </Link>
          </div>

          {/* Mobile Price Ranges */}
          <div
            className={`border-t mt-3 pt-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <Link
              href="/price/under-25"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              Under $25
            </Link>
            <Link
              href="/price/25-50"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              $25 - $50
            </Link>
            <Link
              href="/price/50-100"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              $50 - $100
            </Link>
            <Link
              href="/price/over-100"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              Over $100
            </Link>
          </div>

          {/* Mobile Main Links */}
          <div
            className={`border-t mt-3 pt-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              About
            </Link>
            <Link
              href="/help-center/contact"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              Help Center
            </Link>
            <Link
              href="/sell"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              Sell
            </Link>
          </div>

          {/* Mobile Account Links */}
          <div
            className={`border-t mt-3 pt-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <Link
              href="/wishlist"
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              <Heart
                className="h-5 w-5 mr-2"
                style={{ color: colors.accent.premium }}
              />
              My Wishlist
            </Link>
            <Link
              href="/messages"
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              <MessageCircle
                className="h-5 w-5 mr-2"
                style={{ color: colors.secondary.main }}
              />
              Messages
            </Link>
            <Link
              href="/notifications"
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              <Bell
                className="h-5 w-5 mr-2"
                style={{ color: colors.secondary.main }}
              />
              Notifications
            </Link>
            <Link
              href="/login"
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              <User
                className="h-5 w-5 mr-2"
                style={{ color: colors.secondary.main }}
              />
              Sign In
            </Link>
            <Link
              href="/register"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"}`}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
