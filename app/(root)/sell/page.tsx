"use client";

import React, { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { colors } from "@/lib/theme/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Phone, Star, Shield, CheckCircle } from "lucide-react";

export default function Sell() {
  const { isDarkMode } = useThemeStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    condition: "",
    location: "",
    contactPhone: "",
    contactEmail: "",
    images: [] as File[],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const categories = [
    {
      id: "gems",
      name: "Gems",
      subcategories: ["Blue Sapphire", "Ruby", "Emerald", "Diamond", "Other"],
    },
    {
      id: "jewellery",
      name: "Jewellery",
      subcategories: ["Rings", "Necklaces", "Earrings", "Bracelets", "Other"],
    },
    {
      id: "metals",
      name: "Precious Metals",
      subcategories: ["Gold", "Silver", "Platinum", "Other"],
    },
    {
      id: "services",
      name: "Services",
      subcategories: ["Certification", "Valuation", "Repair", "Other"],
    },
  ];

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
  const locations = ["Colombo", "Kandy", "Galle", "Negombo", "Jaffna", "Other"];

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ad Title *</label>
            <Input
              placeholder="e.g., Beautiful Blue Sapphire Ring"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              className={`w-full p-3 border rounded-lg resize-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              rows={4}
              placeholder="Describe your item in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (LKR) *
              </label>
              <Input
                type="number"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Condition *
              </label>
              <select
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                value={formData.condition}
                onChange={(e) => handleInputChange("condition", e.target.value)}
                required
              >
                <option value="">Select condition</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Category & Location</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              className={`w-full p-3 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {formData.category && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Subcategory
              </label>
              <select
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                value={formData.subcategory}
                onChange={(e) =>
                  handleInputChange("subcategory", e.target.value)
                }
              >
                <option value="">Select subcategory</option>
                {categories
                  .find((cat) => cat.id === formData.category)
                  ?.subcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Location *</label>
            <select
              className={`w-full p-3 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">Upload up to 10 images</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
              style={{ backgroundColor: colors.primary.main }}
            >
              Choose Images
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = formData.images.filter(
                        (_, i) => i !== index,
                      );
                      setFormData((prev) => ({ ...prev, images: newImages }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              placeholder="+94 77 123 4567"
              value={formData.contactPhone}
              onChange={(e) =>
                handleInputChange("contactPhone", e.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.contactEmail}
              onChange={(e) =>
                handleInputChange("contactEmail", e.target.value)
              }
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Privacy Notice
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your contact information will be visible to potential buyers.
                  We recommend using a dedicated contact number for safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.primary.main }}
          >
            Sell Your Items
          </h1>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Post your ad and reach thousands of potential buyers
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentStep / totalSteps) * 100}%`,
                backgroundColor: colors.primary.main,
              }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div
            className={`rounded-lg p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="px-6"
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-6"
                style={{ backgroundColor: colors.primary.main }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="px-6"
                style={{ backgroundColor: colors.accent.features }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Post Ad
              </Button>
            )}
          </div>
        </form>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            <Star
              className="h-8 w-8 mb-4"
              style={{ color: colors.accent.premium }}
            />
            <h3 className="text-lg font-semibold mb-2">Premium Visibility</h3>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Your ads get featured placement for maximum exposure
            </p>
          </div>

          <div
            className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            <Shield
              className="h-8 w-8 mb-4"
              style={{ color: colors.accent.features }}
            />
            <h3 className="text-lg font-semibold mb-2">Secure Transactions</h3>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Safe payment processing and buyer protection
            </p>
          </div>

          <div
            className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            <Phone
              className="h-8 w-8 mb-4"
              style={{ color: colors.primary.main }}
            />
            <h3 className="text-lg font-semibold mb-2">Direct Communication</h3>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Connect directly with interested buyers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
