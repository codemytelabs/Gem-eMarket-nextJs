"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Bell,
  Gem,
  Circle,
  Sparkles,
  Crown,
  Store,
  Settings,
  Plus,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories, featuredLinks } from "@/config/const/navLinks";
import { useThemeStore } from "@/store/themeStore";
import { useTheme } from "next-themes";
import { USER_ROLES } from "@/types/enums/role.enum";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    "allCategories",
  );
  const [hoveredCategory, setHoveredCategory] = useState("gems");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setActiveCategory(null);
        setShowSearchBar(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
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

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    signOut();
  };

  // "Sell" link: guest → login, BUYER → seller registration, SELLER → dashboard
  const isSeller = session?.user?.role === USER_ROLES.SELLER;
  const sellHref = !session?.user
    ? "/login?next=/seller-registration"
    : isSeller
      ? "/dashboard"
      : "/seller-registration";
  const sellLabel = isSeller ? "Seller Dashboard" : "Sell";

  // Resolve dynamic href/name for subcategory items that depend on auth state.
  // "sellers > new" = "Become a Seller" for guests/buyers, "New Listing" for sellers.
  const resolveSubcat = (
    catId: string,
    subcat: { id: string; name: string; href: string },
  ) => {
    if (catId === "sellers" && subcat.id === "new") {
      if (isSeller)
        return { href: "/dashboard/listings/new", name: "New Listing" };
      if (!session?.user)
        return { href: "/login?next=/seller-registration", name: subcat.name };
    }
    return { href: subcat.href, name: subcat.name };
  };

  // Category content mapping with images
  const categoryContent: Record<string, React.ReactNode> = {
    allCategories: (
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className="col-span-1 border-r pr-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`p-2 cursor-pointer rounded ${hoveredCategory === category.id ? "bg-background" : ""}`}
              onMouseEnter={() => handleCategoryHover(category.id)}
            >
              <span className="font-medium text-text">{category.name}</span>
            </div>
          ))}
        </div>

        <div className="col-span-4 pl-4">
          <h3 className="font-bold text-lg mb-3 text-primary">
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
                    return <Plus className="w-16 h-16 text-features" />;
                  }

                  // Regular category icons
                  switch (categoryId) {
                    case "gems":
                      return <Gem className="w-12 h-12 text-primary" />;
                    case "precious-metals":
                      return <Circle className="w-12 h-12 text-secondary" />;
                    case "jewellery":
                      return <Crown className="w-12 h-12 text-premium" />;
                    case "services":
                      return <Settings className="w-12 h-12 text-features" />;
                    case "sellers":
                      return <Store className="w-12 h-12 text-primary-dark" />;
                    default:
                      return <Sparkles className="w-12 h-12 text-primary" />;
                  }
                };

                const resolved = resolveSubcat(hoveredCategory ?? "", subcat);
                return (
                  <div key={subcat.id} className="flex flex-col items-center">
                    <Link href={resolved.href} className="group">
                      <div className="mb-2 w-24 h-24 rounded-lg border-2 flex items-center justify-center transition-all duration-200 group-hover:scale-105 bg-background border-border group-hover:border-primary-light">
                        {getCategoryIcon(hoveredCategory, subcat.id)}
                      </div>
                    </Link>
                    <Link
                      href={resolved.href}
                      className="text-center py-1 text-light-text hover:text-primary"
                    >
                      {resolved.name}
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
            <h3 className="font-bold text-text">{section.title}</h3>
            <ul className="space-y-1">
              {section.items.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-light-text hover:text-primary"
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
        <h3 className="font-bold text-text">Select Price Range</h3>
        <div className="grid grid-cols-4 gap-2">
          <Link
            href="#"
            className="block p-2 border border-border rounded text-center text-text hover:bg-background"
          >
            Under $25
          </Link>
          <Link
            href="#"
            className="block p-2 border border-border rounded text-center text-text hover:bg-background"
          >
            $25 - $50
          </Link>
          <Link
            href="#"
            className="block p-2 border border-border rounded text-center text-text hover:bg-background"
          >
            $50 - $100
          </Link>
          <Link
            href="#"
            className="block p-2 border border-border rounded text-center text-text hover:bg-background"
          >
            $100+
          </Link>
        </div>
        <div className="pt-2">
          <h4 className="font-medium text-text mb-2">Custom Range</h4>
          <div className="flex items-center space-x-4">
            <div className="w-24">
              <label className="block text-sm text-light-text">Min</label>
              <input
                type="number"
                className="w-full p-2 border border-border rounded bg-surface text-text"
                placeholder="$0"
              />
            </div>
            <div className="text-light-text">to</div>
            <div className="w-24">
              <label className="block text-sm text-light-text">Max</label>
              <input
                type="number"
                className="w-full p-2 border border-border rounded bg-surface text-text"
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
      className={`bg-surface text-text shadow-md transition-colors duration-300`}
    >
      {/* Top bar with logo, search, and utilities */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/images/blue-sapphire-gemstone-free-png.webp"
                  alt="Lumevelo"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-bold text-xl text-primary">Lumevelo</span>
            </Link>
          </div>

          {/* Search bar - hidden on mobile and when no category selected */}
          {showSearchBar && (
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search gems, jewellery, sellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="filled"
                    sizeVariant="md"
                    rightIcon={
                      <button type="submit">
                        <Search className="h-5 w-5 text-primary" />
                      </button>
                    }
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right side navigation items - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language selector - deferred until i18n is implemented in a later phase */}

            {/* Dark Mode Toggle */}
            <button
              onClick={changeTheme}
              className={`p-1 rounded-full bg-background`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {session?.user && (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="flex items-center hover:text-gray-600 relative"
                >
                  <Bell className="h-5 w-5 text-secondary" />
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
                  <MessageCircle className="h-5 w-5 text-secondary" />
                  <span className="absolute -top-2 -right-2 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white bg-premium">
                    2
                  </span>
                </Link>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className="flex items-center hover:text-gray-600"
                >
                  <Heart className="h-5 w-5 text-premium" />
                </Link>
              </>
            )}

            {/* Profile menu / Sign In */}
            {session?.user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-full p-1 hover:bg-background transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-light-text transform transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-text">
                        {session.user.name}
                      </p>
                      <p className="truncate text-xs text-light-text">
                        {session.user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      {session.user.role === USER_ROLES.SELLER ? (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
                        >
                          <LayoutDashboard className="h-4 w-4 text-light-text" />
                          Seller Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/seller-registration"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-background"
                        >
                          <Store className="h-4 w-4" />
                          Become a Seller
                        </Link>
                      )}
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
                      >
                        <Settings className="h-4 w-4 text-light-text" />
                        Edit Profile
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-premium hover:bg-background"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<User className="h-4 w-4" />}
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
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
              className="inline-flex items-center justify-center p-2 rounded-md text-text hover:bg-background focus:outline-none"
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
            placeholder="Search gems, jewellery, sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant={isDarkMode ? "filled" : "default"}
            sizeVariant="md"
            fullWidth
            rightIcon={
              <button type="submit">
                <Search className="h-5 w-5 text-primary" />
              </button>
            }
          />
        </form>
      </div>

      {/* Categories menu */}
      <div
        className="border-t bg-background border-border transition-colors duration-300"
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
                    ? "font-semibold text-primary"
                    : "text-light-text hover:text-text"
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
                    ? "font-semibold text-primary"
                    : "text-light-text hover:text-text"
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
                    ? "font-semibold text-primary"
                    : "text-light-text hover:text-text"
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
                className={`whitespace-nowrap text-base font-medium text-light-text hover:text-text`}
              >
                About
              </Link>
              <Link
                href="/help-center/contact"
                className={`whitespace-nowrap text-base font-medium text-light-text hover:text-text`}
              >
                Help Center
              </Link>
              <Link
                href={sellHref}
                className={`whitespace-nowrap text-base font-medium text-light-text hover:text-text`}
              >
                {sellLabel}
              </Link>
            </div>
          </div>

          {/* Dropdown menu content */}
          {activeCategory && (
            <div className="absolute z-50 left-0 right-0 border-t border-b shadow-lg bg-surface border-border">
              <div className="max-w-7xl mx-auto">
                {categoryContent[activeCategory]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className={`px-2 pt-2 pb-3 shadow-inner bg-background`}>
          {/* Mobile Category Navigation */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="mb-2">
                <button
                  onClick={() => toggleMobileCategory(category.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md ${
                    expandedMobileCategory === category.id
                      ? "bg-background text-text"
                      : "text-light-text hover:bg-background"
                  } font-medium`}
                >
                  <span>{category.name}</span>
                  <ChevronDown
                    className={`h-4 w-4 transform ${expandedMobileCategory === category.id ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedMobileCategory === category.id && (
                  <div className="mt-1 ml-4 space-y-1">
                    {category.subcategories.map((subcat) => {
                      const resolved = resolveSubcat(category.id, subcat);
                      return (
                        <Link
                          href={resolved.href}
                          key={subcat.id}
                          className="block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background"
                        >
                          {resolved.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Featured Links */}
          <div className={`border-t mt-3 pt-3 border-border`}>
            <Link
              href="/featured"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              Featured
            </Link>
            <Link
              href="/deals"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              Deals
            </Link>
          </div>

          {/* Mobile Price Ranges */}
          <div className={`border-t mt-3 pt-3 border-border`}>
            <Link
              href="/price/under-25"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              Under $25
            </Link>
            <Link
              href="/price/25-50"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              $25 - $50
            </Link>
            <Link
              href="/price/50-100"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              $50 - $100
            </Link>
            <Link
              href="/price/over-100"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              Over $100
            </Link>
          </div>

          {/* Mobile Main Links */}
          <div className={`border-t mt-3 pt-3 border-border`}>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              About
            </Link>
            <Link
              href="/help-center/contact"
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              Help Center
            </Link>
            <Link
              href={sellHref}
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              {sellLabel}
            </Link>
          </div>

          {/* Mobile Account Links */}
          <div className={`border-t mt-3 pt-3 border-border`}>
            {session?.user ? (
              <>
                <Link
                  href="/wishlist"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <Heart className="h-5 w-5 mr-2 text-premium" />
                  My Wishlist
                </Link>
                <Link
                  href="/messages"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <MessageCircle className="h-5 w-5 mr-2 text-secondary" />
                  Messages
                </Link>
                <Link
                  href="/notifications"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <Bell className="h-5 w-5 mr-2 text-secondary" />
                  Notifications
                </Link>
                {session.user.role === USER_ROLES.SELLER ? (
                  <Link
                    href="/dashboard"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2 text-light-text" />
                    Seller Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/seller-registration"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-background`}
                  >
                    <Store className="h-5 w-5 mr-2" />
                    Become a Seller
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <Settings className="h-5 w-5 mr-2 text-light-text" />
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-left text-premium hover:bg-background`}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <User className="h-5 w-5 mr-2 text-secondary" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
