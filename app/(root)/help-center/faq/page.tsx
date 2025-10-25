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
      question: "How do I track my order?",
      answer:
        "You can track your order by visiting the 'My Orders' section in your account dashboard. Click on the specific order and you'll find a tracking number and link that will direct you to our shipping partner's website for real-time updates.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Please fill out the return form included with your package or visit the 'Returns' section on our website to initiate the process.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 3-5 business days within the continental US. Express shipping options (1-2 business days) are available at checkout for an additional fee. International shipping times vary by location.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary based on location. These details will be calculated and displayed during checkout before you complete your purchase.",
    },
    {
      question: "How can I change or cancel my order?",
      answer:
        "You can modify or cancel your order within 1 hour of placing it by contacting our customer service team. After this window, orders enter our fulfillment process and cannot be modified, but you can return the items once received.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
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
