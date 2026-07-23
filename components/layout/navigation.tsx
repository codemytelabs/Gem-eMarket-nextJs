"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  Store,
  Settings,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { categories, featuredLinks } from "@/config/const/navLinks";
import { useThemeStore } from "@/store/themeStore";
import { useTheme } from "next-themes";
import { USER_ROLES } from "@/types/enums/role.enum";
import { useSellerCta } from "@/hooks/useSellerCta";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useMessagingStore } from "@/store/messagingStore";
import MessagesPopover from "@/components/messaging/MessagesPopover";
import NotificationsDropdown from "@/components/messaging/NotificationsDropdown";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function Navigation() {
  const t = useTranslations("nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState("gems");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const mobileNotificationsRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const allCategoriesCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const isMessagesPopoverOpen = useMessagingStore(
    (s) => s.isMessagesPopoverOpen,
  );
  const isNotificationsPanelOpen = useMessagingStore(
    (s) => s.isNotificationsPanelOpen,
  );
  const toggleMessagesPopover = useMessagingStore(
    (s) => s.toggleMessagesPopover,
  );
  const closeMessagesPopover = useMessagingStore((s) => s.closeMessagesPopover);
  const toggleNotificationsPanel = useMessagingStore(
    (s) => s.toggleNotificationsPanel,
  );
  const closeNotificationsPanel = useMessagingStore(
    (s) => s.closeNotificationsPanel,
  );
  const unreadMessagesTotal = useMessagingStore((s) => s.unreadMessagesTotal());
  const unreadNotificationsTotal = useMessagingStore((s) =>
    s.unreadNotificationsTotal(),
  );

  // Close dropdowns when clicking outside. The desktop and mobile bells
  // render simultaneously (just CSS-hidden at different breakpoints), so
  // that one passes both refs — closing only fires once the click is
  // outside whichever of the two is actually visible.
  useOutsideClick([categoryMenuRef], () => setActiveCategory(null));
  useOutsideClick([profileMenuRef, mobileProfileMenuRef], () =>
    setIsProfileMenuOpen(false),
  );
  useOutsideClick(
    [notificationsRef, mobileNotificationsRef],
    closeNotificationsPanel,
  );
  useOutsideClick([messagesRef], closeMessagesPopover);

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
    setIsMenuOpen((prev) => {
      const next = !prev;
      if (next) setIsProfileMenuOpen(false);
      return next;
    });
  };

  const toggleMobileProfileMenu = () => {
    setIsProfileMenuOpen((prev) => {
      const next = !prev;
      if (next) closeMobileMenu();
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    setActiveCategory((prev) => {
      if (prev === category) return null;
      if (category === "allCategories") setHoveredCategory("gems");
      return category;
    });
  };

  const closeDropdown = () => {
    setActiveCategory(null);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setExpandedMobileCategory(null);
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

  const openAllCategoriesMenu = () => {
    if (allCategoriesCloseTimeoutRef.current) {
      clearTimeout(allCategoriesCloseTimeoutRef.current);
    }
    setActiveCategory((prev) => {
      if (prev !== "allCategories") setHoveredCategory("gems");
      return "allCategories";
    });
  };

  const scheduleCloseAllCategoriesMenu = () => {
    allCategoriesCloseTimeoutRef.current = setTimeout(() => {
      setActiveCategory((prev) => (prev === "allCategories" ? null : prev));
    }, 150);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    // No redirectTo would default to the current page (window.location.href)
    // — on a protected page like /dashboard, that meant logging out just
    // landed you right back where middleware would otherwise have to
    // re-redirect you away from. Send straight to a safe public page.
    signOut({ redirectTo: "/" });
  };

  // "Start Selling" / "Seller Dashboard" link — shared with Footer and About
  // so the href/label rule lives in one place (lib/seller-cta.ts). Guests
  // land on /seller-registration too; proxy.ts redirects them to /login.
  const { isSeller, href: sellHref, label: sellLabel } = useSellerCta();

  // TODO: wire to real wishlist count once the wishlist API exists
  const wishlistCount = 0;

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
      <div className="grid grid-cols-5 gap-6 py-4">
        <div className="col-span-1 border-r pr-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex items-center gap-2 p-2 cursor-pointer rounded ${hoveredCategory === category.id ? "bg-background" : ""}`}
              onMouseEnter={() => handleCategoryHover(category.id)}
            >
              <div className="relative w-8 h-8 rounded flex-shrink-0 overflow-hidden skeleton-shimmer">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
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
                const resolved = resolveSubcat(hoveredCategory ?? "", subcat);
                return (
                  <div key={subcat.id} className="flex flex-col items-center">
                    <Link
                      href={resolved.href}
                      className="group"
                      onClick={closeDropdown}
                    >
                      <div className="relative mb-2 w-24 h-24 rounded-lg border-2 overflow-hidden transition-all duration-200 group-hover:scale-105 skeleton-shimmer border-border group-hover:border-primary-light">
                        <Image
                          src={subcat.image}
                          alt={resolved.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <Link
                      href={resolved.href}
                      className="text-center py-1 text-light-text hover:text-primary"
                      onClick={closeDropdown}
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
      <div className="grid grid-cols-3 gap-6 py-4">
        {featuredLinks.map((section, index) => (
          <div key={index} className="space-y-2">
            <h3 className="font-bold text-text">{section.title}</h3>
            <ul className="space-y-1">
              {section.items.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-light-text hover:text-primary"
                    onClick={closeDropdown}
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
  };

  // Shared by the desktop and mobile profile triggers so the dropdown
  // markup (and its "Start Selling"/"Seller Dashboard" branching) isn't
  // duplicated between the two breakpoints.
  const profileDropdownContent = session?.user && (
    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <p className="truncate text-sm font-semibold text-text">
          {session.user.name}
        </p>
        <p className="truncate text-xs text-light-text">{session.user.email}</p>
      </div>
      <div className="py-1">
        {session.user.role === USER_ROLES.SELLER ? (
          <Link
            href="/dashboard"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
          >
            <LayoutDashboard className="h-4 w-4 text-light-text" />
            {t("sellerDashboard")}
          </Link>
        ) : (
          <Link
            href="/seller-registration"
            onClick={() => setIsProfileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-background"
          >
            <Store className="h-4 w-4" />
            {t("startSelling")}
          </Link>
        )}

        <Link
          href="/wishlist"
          onClick={() => setIsProfileMenuOpen(false)}
          className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
        >
          <Heart className="h-4 w-4 text-premium" />
          {t("savedItems")}
          {wishlistCount > 0 && (
            <span className="ml-auto rounded-full bg-premium px-1.5 py-0.5 text-xs text-white">
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/settings"
          onClick={() => setIsProfileMenuOpen(false)}
          className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background"
        >
          <Settings className="h-4 w-4 text-light-text" />
          {t("editProfile")}
        </Link>
      </div>
      <div className="border-t border-border py-1">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-premium hover:bg-background"
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <nav
      className={`bg-surface text-text shadow-md transition-colors duration-300`}
    >
      {/* Top bar with logo, search, and utilities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Left cluster: mobile hamburger + logo. Grouped together (rather
              than as separate flex children) so they stay adjacent instead
              of being spread apart by justify-between. */}
          <div className="flex items-center gap-1 min-[375px]:gap-2">
            <button
              onClick={toggleMenu}
              className="md:hidden -ml-1 inline-flex items-center justify-center p-2 rounded-md text-text hover:bg-background focus:outline-none"
              aria-label={t("toggleMenu")}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 min-[375px]:gap-2"
            >
              <div className="relative h-9 w-9 min-[375px]:h-10 min-[375px]:w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/images/blue-sapphire-gemstone-free-png.webp"
                  alt="Lumevelo"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-bold text-lg min-[375px]:text-xl text-primary">
                Lumevelo
              </span>
            </Link>
          </div>

          {/* Search bar - always visible on desktop */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
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

          {/* Right side navigation items - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />

            <div className="h-5 w-px bg-border" />

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
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={toggleNotificationsPanel}
                  className="flex items-center hover:text-gray-600 relative"
                  aria-label={t("notifications")}
                >
                  <Bell className="h-5 w-5 text-secondary" />
                  {unreadNotificationsTotal > 0 && (
                    <span className="absolute -top-2 -right-2 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white bg-premium">
                      {unreadNotificationsTotal > 9
                        ? "9+"
                        : unreadNotificationsTotal}
                    </span>
                  )}
                </button>
                {isNotificationsPanelOpen && <NotificationsDropdown />}
              </div>
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

                {isProfileMenuOpen && profileDropdownContent}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="whitespace-nowrap text-sm font-medium text-text hover:text-primary transition-colors"
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary-dark px-4 py-1.5 rounded-full transition-colors"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          {/* Right cluster - mobile: notifications + profile (or sign in) */}
          <div className="md:hidden flex items-center gap-2 min-[375px]:gap-4">
            {session?.user && (
              <div className="relative" ref={mobileNotificationsRef}>
                <button
                  onClick={toggleNotificationsPanel}
                  className="p-1 relative"
                  aria-label={t("notifications")}
                >
                  <Bell className="h-5 w-5 text-secondary" />
                  {unreadNotificationsTotal > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-premium text-[10px] text-white">
                      {unreadNotificationsTotal > 9
                        ? "9+"
                        : unreadNotificationsTotal}
                    </span>
                  )}
                </button>
                {isNotificationsPanelOpen && <NotificationsDropdown />}
              </div>
            )}

            {session?.user ? (
              <div className="relative" ref={mobileProfileMenuRef}>
                <button
                  onClick={toggleMobileProfileMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-label={t("accountMenu")}
                >
                  <User className="h-5 w-5" />
                </button>
                {isProfileMenuOpen && profileDropdownContent}
              </div>
            ) : (
              <Link href="/login" className="p-1" aria-label={t("signIn")}>
                <User className="h-6 w-6 text-text" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories menu */}
      <div
        className="border-t bg-primary/5 dark:bg-background border-border transition-colors duration-300"
        ref={categoryMenuRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="hidden md:flex items-center py-2 relative">
            {/* Left aligned menu items */}
            <div className="flex items-center space-x-8">
              <div
                onMouseEnter={openAllCategoriesMenu}
                onMouseLeave={scheduleCloseAllCategoriesMenu}
              >
                <button
                  onClick={() => toggleCategory("allCategories")}
                  className={`flex items-center whitespace-nowrap text-base font-medium ${
                    activeCategory === "allCategories"
                      ? "font-semibold text-primary"
                      : "text-light-text hover:text-text"
                  }`}
                >
                  {t("allCategories")}
                  <ChevronDown
                    className={`h-4 w-4 ml-1 transform ${activeCategory === "allCategories" ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <button
                onClick={() => toggleCategory("featured")}
                className={`flex items-center whitespace-nowrap text-base font-medium ${
                  activeCategory === "featured"
                    ? "font-semibold text-primary"
                    : "text-light-text hover:text-text"
                }`}
              >
                {t("featured")}
                <ChevronDown
                  className={`h-4 w-4 ml-1 transform ${activeCategory === "featured" ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Right aligned menu items */}
            <div className="ml-auto flex items-center space-x-8">
              <Link
                href="/about"
                className={`whitespace-nowrap text-base font-medium text-light-text hover:text-text`}
              >
                {t("about")}
              </Link>
              <Link
                href="/blogs"
                className={`whitespace-nowrap text-base font-medium text-light-text hover:text-text`}
              >
                {t("blog")}
              </Link>
              <Link
                href="/help-center/contact"
                className={`whitespace-nowrap text-base font-medium text-light-text hover:text-text`}
              >
                {t("helpCenter")}
              </Link>
              <Link
                href={sellHref}
                className="whitespace-nowrap text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary-dark px-4 py-1.5 rounded-full transition-colors"
              >
                {sellLabel}
              </Link>
            </div>
          </div>

          {/* Dropdown menu content */}
          {activeCategory && (
            <div
              className="absolute z-50 left-0 right-0 border-t border-b shadow-lg bg-surface border-border"
              onMouseEnter={
                activeCategory === "allCategories"
                  ? openAllCategoriesMenu
                  : undefined
              }
              onMouseLeave={
                activeCategory === "allCategories"
                  ? scheduleCloseAllCategoriesMenu
                  : undefined
              }
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {categoryContent[activeCategory]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div
          className={`px-2 pt-2 pb-3 shadow-inner bg-primary/5 dark:bg-background`}
        >
          {/* Search — lives here now that the top bar is icon-only */}
          <form onSubmit={handleSearchSubmit} className="px-1 pb-3">
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

          {/* Language — moved here from the always-visible bar for the same
              reason as the theme toggle below: a set-once preference, not
              something checked frequently */}
          <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-border pb-3">
            <span className="text-base font-medium text-text">
              {t("language")}
            </span>
            <LanguageSwitcher />
          </div>

          {/* Theme toggle — moved here from the always-visible bar since it's
              a set-once preference, not something checked frequently */}
          <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-border pb-3">
            <span className="text-base font-medium text-text">
              {t("darkMode")}
            </span>
            <button
              onClick={changeTheme}
              role="switch"
              aria-checked={isDarkMode}
              aria-label={t("toggleDarkMode")}
              className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
                isDarkMode ? "bg-gray-700" : "bg-blue-100"
              }`}
            >
              <span
                className={`absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transform transition-transform ${
                  isDarkMode ? "translate-x-7" : "translate-x-0"
                }`}
              >
                {isDarkMode ? (
                  <Moon className="h-3.5 w-3.5 text-indigo-600" />
                ) : (
                  <Sun className="h-3.5 w-3.5 text-yellow-500" />
                )}
              </span>
            </button>
          </div>

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
                          onClick={closeMobileMenu}
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
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              {t("featured")}
            </Link>
            <Link
              href="/deals"
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              {t("deals")}
            </Link>
          </div>

          {/* Mobile Main Links */}
          <div className={`border-t mt-3 pt-3 border-border`}>
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              {t("about")}
            </Link>
            <Link
              href="/blogs"
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              {t("blog")}
            </Link>
            <Link
              href="/help-center/contact"
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
            >
              {t("helpCenter")}
            </Link>
            <Link
              href={sellHref}
              onClick={closeMobileMenu}
              className="block mt-2 px-3 py-2 rounded-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary-dark text-center transition-colors"
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
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <Heart className="h-5 w-5 mr-2 text-premium" />
                  {t("savedItems")}
                </Link>
                <Link
                  href="/messages"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background relative`}
                >
                  <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                  {t("messages")}
                  {unreadMessagesTotal > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-premium text-xs text-white">
                      {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
                    </span>
                  )}
                </Link>
                {session.user.role === USER_ROLES.SELLER ? (
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2 text-light-text" />
                    {t("sellerDashboard")}
                  </Link>
                ) : (
                  <Link
                    href="/seller-registration"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-background`}
                  >
                    <Store className="h-5 w-5 mr-2" />
                    {t("startSelling")}
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <Settings className="h-5 w-5 mr-2 text-light-text" />
                  {t("editProfile")}
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className={`flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-left text-premium hover:bg-background`}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  <User className="h-5 w-5 mr-2 text-secondary" />
                  {t("signIn")}
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-light-text hover:bg-background`}
                >
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating message button - logged-in users only */}
      {session?.user && (
        <div className="fixed bottom-6 right-6 z-[100]" ref={messagesRef}>
          <button
            onClick={toggleMessagesPopover}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors"
            aria-label={t("messages")}
          >
            <MessageCircle className="h-7 w-7" />
            {unreadMessagesTotal > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-premium text-xs text-white">
                {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
              </span>
            )}
          </button>
          {isMessagesPopoverOpen && <MessagesPopover />}
        </div>
      )}
    </nav>
  );
}
