"use client";

import React, { useState } from "react";
import { useThemeStore } from "@/store/themeStore";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqPage() {
  const { isDarkMode } = useThemeStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FaqItem[] = [
    {
      question: "What is Lumevelo?",
      answer:
        "Lumevelo is a global online marketplace for certified gems, precious metals, and fine jewellery. We connect buyers with verified sellers worldwide so you can browse, list, and trade with confidence.",
    },
    {
      question: "How do I contact a seller about a listing?",
      answer:
        "Open the listing you're interested in and use the enquiry form or contact details provided on the page to message the seller directly. Our support team is also available if you need help reaching a seller.",
    },
    {
      question: "How are sellers verified on Lumevelo?",
      answer:
        "Sellers go through a verification process before they can list items, which includes confirming their identity and business details. Verified sellers display a verification badge on their profile and listings.",
    },
    {
      question: "Are gemstones and jewellery on the platform certified?",
      answer:
        "Many sellers provide certification or grading reports from recognised gemological laboratories along with their listings. Always check the listing details for certification information and ask the seller directly if you have questions about authenticity.",
    },
    {
      question: "How do I list an item for sale?",
      answer:
        "Create a seller account, then use the 'Sell' page to submit details about your gem, jewellery, or precious metal item, including photos, description, and pricing. Once submitted, your listing will be reviewed before it goes live.",
    },
    {
      question: "Does Lumevelo handle delivery or shipping of items?",
      answer:
        "No. Lumevelo is a marketplace that connects buyers and sellers. We do not handle delivery, shipping, or courier services ourselves. Buyers and sellers arrange collection or delivery directly with each other once a deal is agreed.",
    },
    {
      question: "How do payments and subscriptions work?",
      answer:
        "Seller subscription plans and platform fees are processed securely through Stripe and PayHere. Payments for individual items are arranged directly between buyers and sellers, and we recommend agreeing on terms in writing before completing any transaction.",
    },
    {
      question:
        "What should I do if I have a problem with a seller or listing?",
      answer:
        "If you experience an issue with a seller, a listing, or suspect fraudulent activity, please use the Complaints page to report the issue. Our team will review the report and follow up with you.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1
        className={`text-3xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
      >
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className={`rounded-lg overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <button
              className={`flex justify-between items-center w-full p-4 text-left font-medium ${isDarkMode ? "text-white hover:bg-gray-600" : "hover:bg-gray-50"}`}
              onClick={() => toggleItem(index)}
            >
              <span>{item.question}</span>
              <svg
                className={`w-5 h-5 transition-transform ${openIndex === index ? "transform rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openIndex === index && (
              <div
                className={`p-4 border-t ${isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-200 text-gray-600"}`}
              >
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={`mt-8 p-6 rounded-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white"} shadow-md`}
      >
        <h2 className="text-xl font-semibold mb-4">
          Didn&apos;t Find Your Answer?
        </h2>
        <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
          If you couldn&apos;t find the information you&apos;re looking for,
          please reach out to our customer service team.
        </p>
        <a
          href="/help-center/contact"
          className={`inline-block px-6 py-2 ${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white rounded-md hover:bg-blue-600 transition-colors`}
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
