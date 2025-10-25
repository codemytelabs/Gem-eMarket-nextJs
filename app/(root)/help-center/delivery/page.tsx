"use client";

import React from "react";
import { useThemeStore } from "@/store/themeStore";

export default function DeliveryPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
      >
        Delivery Information
      </h1>

      <div
        className={`rounded-lg p-6 mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Shipping Methods
        </h2>

        <div className="space-y-6">
          <div>
            <h3
              className={`font-medium text-lg mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Standard Shipping
            </h3>
            <p
              className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              3-5 business days (Monday through Friday, excluding holidays)
            </p>
            <ul
              className={`list-disc list-inside ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              <li>Free on orders over $50</li>
              <li>$5.99 for orders under $50</li>
              <li>Available for all 50 US states</li>
            </ul>
          </div>

          <div>
            <h3
              className={`font-medium text-lg mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Express Shipping
            </h3>
            <p
              className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              1-2 business days (Monday through Friday, excluding holidays)
            </p>
            <ul
              className={`list-disc list-inside ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              <li>$12.99 flat rate</li>
              <li>Free on orders over $150</li>
              <li>Order by 2PM EST for same-day processing</li>
            </ul>
          </div>

          <div>
            <h3
              className={`font-medium text-lg mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              International Shipping
            </h3>
            <p
              className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              7-14 business days (varies by destination)
            </p>
            <ul
              className={`list-disc list-inside ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              <li>
                Starting at $24.99 (calculated at checkout based on destination
                and weight)
              </li>
              <li>Available to most countries</li>
              <li>
                Import duties and taxes may apply and are the responsibility of
                the customer
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg p-6 mb-8 ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Order Tracking
        </h2>
        <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          You&apos;ll receive a shipping confirmation email with a tracking
          number once your order ships. You can also find tracking information
          in your account under &quot;Order History&quot;.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter tracking number"
            className={`flex-grow px-4 py-2 border rounded-md ${isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "border-gray-300"}`}
          />
          <button
            className={`px-6 py-2 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white rounded-md hover:bg-blue-600 transition-colors`}
          >
            Track Order
          </button>
        </div>
      </div>

      <div
        className={`rounded-lg p-6 ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div>
            <h3
              className={`font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              What happens if I&apos;m not home for delivery?
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              For standard packages, carriers will typically leave the package
              at your door or with a neighbor. For larger items requiring
              signature, a redelivery will be attempted or you can arrange
              pickup from the carrier&apos;s facility.
            </p>
          </div>

          <div>
            <h3
              className={`font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Can I change my delivery address after placing an order?
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Address changes can be accommodated if requested within 1 hour of
              order placement. Please contact customer service immediately if
              you need to change your shipping address.
            </p>
          </div>

          <div>
            <h3
              className={`font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              Do you ship to PO boxes?
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Yes, we ship to PO boxes via USPS, but please note that expedited
              shipping options may not be available for PO box deliveries.
            </p>
          </div>

          <div>
            <h3
              className={`font-medium mb-2 ${isDarkMode ? "text-gray-200" : ""}`}
            >
              What if my package is lost or damaged?
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Please contact our customer service team within 7 days of the
              expected delivery date. We&apos;ll initiate a claim with the
              shipping carrier and arrange for a replacement or refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
