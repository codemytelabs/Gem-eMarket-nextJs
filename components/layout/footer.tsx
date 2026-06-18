import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface text-text border-t border-border pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/images/blue-sapphire-gemstone-free-png.webp"
                  alt="Lumevelo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-xl text-primary">Lumevelo</span>
            </Link>

            <p className="text-light-text mb-4">
              Lumevelo is a global online marketplace for certified gems,
              precious metals, and fine jewellery, connecting buyers and
              verified sellers worldwide, anytime.
            </p>

            <div className="flex space-x-4">
              <a href="#" className="text-light-text hover:text-primary">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-light-text hover:text-primary">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-light-text hover:text-primary">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-light-text hover:text-primary">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Shop By Category */}
          <div>
            <h3 className="text-sm font-semibold text-text tracking-wider uppercase mb-4">
              Shop By Category
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gems" className="text-light-text hover:text-text">
                  Gems
                </Link>
              </li>
              <li>
                <Link
                  href="/precious-metals"
                  className="text-light-text hover:text-text"
                >
                  Precious Metals
                </Link>
              </li>
              <li>
                <Link
                  href="/jewellery"
                  className="text-light-text hover:text-text"
                >
                  Jewellery
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-light-text hover:text-text"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/sellers"
                  className="text-light-text hover:text-text"
                >
                  Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="text-premium hover:text-primary-dark"
                >
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-text tracking-wider uppercase mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-light-text hover:text-text">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/help-center/contact"
                  className="text-light-text hover:text-text"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/help-center/faq"
                  className="text-light-text hover:text-text"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/help-center/complaints"
                  className="text-light-text hover:text-text"
                >
                  Complaints
                </Link>
              </li>
              <li>
                <Link
                  href="/help-center/privacy-policy"
                  className="text-light-text hover:text-text"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-text tracking-wider uppercase mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex">
                <Mail className="h-5 w-5 text-light-text mr-2 flex-shrink-0" />
                <span className="text-light-text">support@lumevelo.com</span>
              </li>
              <li className="flex">
                <Globe className="h-5 w-5 text-light-text mr-2 flex-shrink-0" />
                <span className="text-light-text">
                  Serving buyers & sellers worldwide
                </span>
              </li>
              <li className="flex">
                <Clock className="h-5 w-5 text-light-text mr-2 flex-shrink-0" />
                <span className="text-light-text">
                  Online marketplace — available 24/7
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Copyright */}
        <div className="border-t border-border pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <p className="text-sm text-light-text">
              &copy; {new Date().getFullYear()} Lumevelo. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-light-text mt-4 md:mt-0">
              <ShieldCheck className="h-4 w-4 text-features" />
              Secure payments via Stripe & PayHere
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
