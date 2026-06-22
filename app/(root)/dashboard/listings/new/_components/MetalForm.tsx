"use client";

import { useState } from "react";
import { METAL_TYPE, METAL_PURITY } from "@/types/enums";
import {
  Field,
  TextInput,
  TextArea,
  SelectInput,
  Toggle,
} from "./shared/FormFields";
import { ImageUploader } from "./shared/ImageUploader";
import { ReelUploader } from "./shared/ReelUploader";
import { CertificationUploader } from "./shared/CertificationUploader";
import { LocationField } from "./shared/LocationField";
import { PriceFields } from "./shared/PriceFields";
import { ContactPreferenceFields } from "./shared/ContactPreferenceFields";
import { SubmitBar } from "./shared/SubmitBar";
import { useCreateListing } from "./shared/useCreateListing";
import { COUNTRIES } from "@/lib/utils/countries";
import {
  CATEGORY_IMAGE_MAX,
  CERTIFICATION_IMAGE_MAX,
  getEffectiveLimit,
} from "@/lib/constants/imageLimits";

const SOVEREIGN_TO_GRAMS = 7.9881;

interface MetalFormProps {
  onBack: () => void;
  onSuccess: () => void;
  sellerLocation?: string;
  sellerCountry?: string;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  canUploadReels: boolean;
  reelsRemaining: number | null;
  reelsMaxPerMonth: number | null;
  planMaxImages: number | null;
  planMaxCertificationImages: number | null;
}

export function MetalForm({
  onBack,
  onSuccess,
  sellerLocation = "",
  sellerCountry = "LK",
  sellerPhone = "",
  sellerWhatsapp = "",
  canUploadReels,
  reelsRemaining,
  reelsMaxPerMonth,
  planMaxImages,
  planMaxCertificationImages,
}: MetalFormProps) {
  const imageLimit = getEffectiveLimit(
    CATEGORY_IMAGE_MAX.PRECIOUS_METAL,
    planMaxImages,
  );
  const certLimit = getEffectiveLimit(
    CERTIFICATION_IMAGE_MAX,
    planMaxCertificationImages,
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [reelUrl, setReelUrl] = useState("");
  const [metalType, setMetalType] = useState("");
  const [metalPurity, setMetalPurity] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [weightSovereigns, setWeightSovereigns] = useState("");
  const [origin, setOrigin] = useState("");
  const [locationCountry, setLocationCountry] = useState(sellerCountry);
  const [locationCity, setLocationCity] = useState(sellerLocation);
  const [certificationNumber, setCertificationNumber] = useState("");
  const [certificationImages, setCertificationImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isWholesale, setIsWholesale] = useState(false);

  const [contactPhone, setContactPhone] = useState(sellerPhone);
  const [hideContactPhone, setHideContactPhone] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    Boolean(sellerWhatsapp),
  );
  const [whatsappNumber, setWhatsappNumber] = useState(sellerWhatsapp);

  const { submit, loading, error, fieldErrors } = useCreateListing(onSuccess);

  const handleGramsChange = (val: string) => {
    setWeightGrams(val);
    if (val && !isNaN(Number(val))) {
      setWeightSovereigns((Number(val) / SOVEREIGN_TO_GRAMS).toFixed(4));
    } else {
      setWeightSovereigns("");
    }
  };

  const handleSovereignsChange = (val: string) => {
    setWeightSovereigns(val);
    if (val && !isNaN(Number(val))) {
      setWeightGrams((Number(val) * SOVEREIGN_TO_GRAMS).toFixed(4));
    } else {
      setWeightGrams("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const countryName =
      COUNTRIES.find((c) => c.code === locationCountry)?.name ??
      locationCountry;
    const currentLocation = locationCity
      ? `${locationCity}, ${countryName}`
      : countryName;
    submit({
      title,
      description,
      images,
      reelUrl: reelUrl || undefined,
      category: "PRECIOUS_METAL",
      metalType: metalType || undefined,
      metalPurity: metalPurity || undefined,
      weightGrams: weightGrams ? Number(weightGrams) : undefined,
      weightSovereigns: weightSovereigns ? Number(weightSovereigns) : undefined,
      gemOrigin: origin || undefined,
      currentLocation: currentLocation || undefined,
      certificationNumber: certificationNumber || undefined,
      certificationImages,
      price: price ? Number(price) : undefined,
      currency,
      isWholesale,
      contactPhone: contactPhone || undefined,
      hideContactPhone,
      whatsappEnabled,
      whatsappNumber: whatsappEnabled ? whatsappNumber || undefined : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Field
          label="Listing Title"
          name="title"
          required
          error={fieldErrors.title}
        >
          <TextInput
            placeholder="e.g., 22K Gold Bar — 50g"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Field>

        <Field
          label="Description"
          name="description"
          required
          error={fieldErrors.description}
        >
          <TextArea
            rows={4}
            placeholder="Describe the item, its form (bar, coin, scrap), and condition..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Field>
      </div>

      <ImageUploader
        images={images}
        onChange={setImages}
        max={imageLimit.max}
        isPlanLimited={imageLimit.isPlanLimited}
        label="Photos"
        required={!reelUrl}
      />

      <ReelUploader
        value={reelUrl}
        onChange={setReelUrl}
        canUpload={canUploadReels}
        remaining={reelsRemaining}
        maxPerMonth={reelsMaxPerMonth}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Metal Type"
          name="metalType"
          required
          error={fieldErrors.metalType}
        >
          <SelectInput
            value={metalType}
            onChange={(e) => setMetalType(e.target.value)}
            required
          >
            <option value="">Select metal type</option>
            {Object.values(METAL_TYPE).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field
          label="Purity / Karat"
          name="metalPurity"
          required
          hint="Select the fineness of the metal"
          error={fieldErrors.metalPurity}
        >
          <SelectInput
            value={metalPurity}
            onChange={(e) => setMetalPurity(e.target.value)}
            required
          >
            <option value="">Select purity</option>
            {Object.values(METAL_PURITY).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Weight{" "}
          <span className="text-xs font-normal text-gray-400">
            — fill either field, the other updates automatically
          </span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Grams (g)"
            name="weightGrams"
            required
            error={fieldErrors.weightGrams}
          >
            <TextInput
              type="number"
              min="0"
              step="0.0001"
              placeholder="e.g., 39.94"
              value={weightGrams}
              onChange={(e) => handleGramsChange(e.target.value)}
              required
            />
          </Field>
          <Field
            label="Sovereigns"
            name="weightSovereigns"
            hint="1 sovereign ≈ 7.9881 g"
            error={fieldErrors.weightSovereigns}
          >
            <TextInput
              type="number"
              min="0"
              step="0.0001"
              placeholder="e.g., 5.00"
              value={weightSovereigns}
              onChange={(e) => handleSovereignsChange(e.target.value)}
            />
          </Field>
        </div>
        {weightGrams && weightSovereigns && (
          <p className="text-xs text-gray-400">
            {Number(weightGrams).toFixed(4)} g ={" "}
            {Number(weightSovereigns).toFixed(4)} sovereigns
          </p>
        )}
      </div>

      <Field
        label="Origin"
        name="gemOrigin"
        hint="Optional — country or region where the metal was sourced"
        error={fieldErrors.gemOrigin}
      >
        <TextInput
          placeholder="e.g., South Africa, Switzerland"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
      </Field>

      <LocationField
        country={locationCountry}
        city={locationCity}
        onCountryChange={setLocationCountry}
        onCityChange={setLocationCity}
        required
        label="Current Location"
        hint="Where is the item now?"
        cityPlaceholder="City / Region"
      />

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Certification
        </p>

        <Field
          label="Assay / Hallmark Certificate Number"
          name="certificationNumber"
          hint="Optional"
          error={fieldErrors.certificationNumber}
        >
          <TextInput
            placeholder="e.g., AGMC-2024-00123"
            value={certificationNumber}
            onChange={(e) => setCertificationNumber(e.target.value)}
          />
        </Field>

        <CertificationUploader
          images={certificationImages}
          onChange={setCertificationImages}
          max={certLimit.max}
          isPlanLimited={certLimit.isPlanLimited}
          label="Hallmark / assay documents (optional)"
          hint={`Upload photos of hallmark stamps or assay certificates. Max ${certLimit.max} images.`}
        />
      </div>

      <PriceFields
        price={price}
        currency={currency}
        onPriceChange={setPrice}
        onCurrencyChange={setCurrency}
      />

      <Toggle
        checked={isWholesale}
        onChange={setIsWholesale}
        label="List as wholesale"
        hint="Visible to bulk buyers and dealers looking for stock."
      />

      <ContactPreferenceFields
        contactPhone={contactPhone}
        onContactPhoneChange={setContactPhone}
        hideContactPhone={hideContactPhone}
        onHideContactPhoneChange={setHideContactPhone}
        whatsappEnabled={whatsappEnabled}
        onWhatsappEnabledChange={setWhatsappEnabled}
        whatsappNumber={whatsappNumber}
        onWhatsappNumberChange={setWhatsappNumber}
        contactPhoneError={fieldErrors.contactPhone}
        whatsappNumberError={fieldErrors.whatsappNumber}
      />

      <SubmitBar loading={loading} error={error} onBack={onBack} />
    </form>
  );
}
