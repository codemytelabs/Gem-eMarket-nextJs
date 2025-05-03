"use client";

import React from "react";
import { useThemeStore } from "@/store/themeStore";

export default function About() {
  const { isDarkMode } = useThemeStore();

  return (
    <div
      className={`max-w-4xl mx-auto ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
    >
      <section className="mb-12 text-center">
        <h1
          className={`text-4xl font-bold mb-6 ${isDarkMode ? "text-white" : ""}`}
        >
          About PetPals
        </h1>
        <p
          className={`text-xl mb-8 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Your trusted pet marketplace, connecting pet lovers with top breeders,
          sellers, and essential pet products. From dogs and cats to exotic
          birds and fish, find everything in one place.
        </p>
        <div
          className={`w-full h-64 rounded-lg mb-8 flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
        >
          <span className="text-gray-400">Featured pet marketplace image</span>
        </div>
      </section>

      <section className="mb-12">
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Our Story
        </h2>
        <div
          className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
        >
          <p className="mb-4">
            Founded in 2020 by a group of passionate pet enthusiasts, PetPals
            began with a simple mission: to create a safe, reliable platform
            where pet lovers could find their perfect companion and everything
            needed for their care.
          </p>
          <p className="mb-4">
            What started as a small online community has now grown into one of
            the most trusted pet marketplaces, connecting thousands of
            responsible breeders and sellers with loving homes across the
            country.
          </p>
          <p>
            Our team consists of veterinarians, animal behaviorists, and
            lifelong pet owners who understand the special bond between humans
            and animals. This expertise drives everything we do, from our
            rigorous breeder verification process to our carefully curated
            selection of pet products.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Our Mission
        </h2>
        <div className={`grid md:grid-cols-3 gap-6`}>
          <div
            className={`p-5 rounded-lg text-center ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <div
              className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-600" : "bg-blue-100"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-blue-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}
            >
              Connect
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Bringing together pet lovers with ethical breeders and quality
              sellers in a transparent marketplace.
            </p>
          </div>

          <div
            className={`p-5 rounded-lg text-center ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <div
              className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-600" : "bg-blue-100"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-blue-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}
            >
              Protect
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Ensuring animal welfare through strict seller guidelines and
              responsible breeding practices.
            </p>
          </div>

          <div
            className={`p-5 rounded-lg text-center ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
          >
            <div
              className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-600" : "bg-blue-100"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-blue-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}
            >
              Educate
            </h3>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Providing resources for proper pet care and helping new owners
              make informed decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          What We Offer
        </h2>
        <div
          className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
        >
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Verified Breeders & Sellers
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  All breeders and sellers undergo a thorough verification
                  process to ensure they meet our strict standards for animal
                  welfare and ethical practices.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Wide Selection of Pets
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  From common companions like dogs and cats to exotic reptiles,
                  birds, and aquatic creatures, find the perfect pet for your
                  lifestyle.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Premium Pet Products
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Curated selection of high-quality food, toys, accessories, and
                  healthcare items from trusted brands and innovative startups.
                </p>
              </div>
            </li>

            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <h3 className={`font-medium ${isDarkMode ? "text-white" : ""}`}>
                  Expert Advice & Resources
                </h3>
                <p
                  className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Access to veterinarian-approved guides on pet care, training,
                  nutrition, and health, helping you give your pets the best
                  life possible.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* <section className="mb-12">
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : ''}`}>Our Team</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Emma Wilson", role: "Founder & CEO", background: "Veterinarian with 15+ years experience" },
              { name: "Marcus Chen", role: "Head of Operations", background: "Former animal shelter director" },
              { name: "Sophia Rodriguez", role: "Chief Animal Welfare Officer", background: "Animal behaviorist" },
              { name: "James Taylor", role: "Product Director", background: "Pet industry veteran" }
            ].map((member, index) => (
              <div key={index} className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-md`}>
                <div className={`h-24 w-24 mx-auto mb-3 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{member.name}</h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{member.role}</p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.background}</p>
              </div>
            ))}
          </div>
        </section> */}

      <section>
        <h2
          className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : ""}`}
        >
          Join Our Community
        </h2>
        <div
          className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md text-center`}
        >
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Whether you&apos;re looking for a new pet, selling responsibly bred
            animals, or simply seeking advice from fellow pet lovers, we invite
            you to become part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className={`px-6 py-2 rounded-md ${isDarkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors`}
            >
              Join Today
            </a>
            <a
              href="/help-center/contact"
              className={`px-6 py-2 rounded-md ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"} ${isDarkMode ? "text-white" : "text-gray-800"} transition-colors`}
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
