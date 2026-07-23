"use client";

import { useState } from "react";
import { Handshake, Tag } from "lucide-react";
import {
  GEM_TYPE,
  JEWELLERY_TYPE,
  METAL_TYPE,
  PRICING_TYPE,
} from "@/types/enums";
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

interface JewelleryFormProps {
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

export function JewelleryForm({
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
}: JewelleryFormProps) {
  const imageLimit = getEffectiveLimit(
    CATEGORY_IMAGE_MAX.JEWELLERY,
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
  const [jewelleryType, setJewelleryType] = useState("");
  const [metalType, setMetalType] = useState("");
  const [metalPurity, setMetalPurity] = useState("");
  const [gemType, setGemType] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [ringSize, setRingSize] = useState("");
  const [origin, setOrigin] = useState("");
  const [locationCountry, setLocationCountry] = useState(sellerCountry);
  const [locationCity, setLocationCity] = useState(sellerLocation);
  const [certificationImages, setCertificationImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [negotiable, setNegotiable] = useState(true);
  const [isWholesale, setIsWholesale] = useState(false);

  const [contactPhone, setContactPhone] = useState(sellerPhone);
  const [hideContactPhone, setHideContactPhone] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    Boolean(sellerWhatsapp),
  );
  const [whatsappNumber, setWhatsappNumber] = useState(sellerWhatsapp);

  const { submit, loading, error, fieldErrors } = useCreateListing(onSuccess);

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
      category: "JEWELLERY",
      jewelleryType: jewelleryType || undefined,
      metalType: metalType || undefined,
      metalPurity: metalPurity || undefined,
      gemType: gemType || undefined,
      weightGrams: weightGrams ? Number(weightGrams) : undefined,
      ringSize: ringSize || undefined,
      gemOrigin: origin || undefined,
      currentLocation: currentLocation || undefined,
      certificationImages,
      price: price ? Number(price) : undefined,
      currency,
      pricingType: negotiable ? PRICING_TYPE.NEGOTIABLE : undefined,
      isWholesale,
      contactPhone: contactPhone || undefined,
      hideContactPhone,
      whatsappEnabled,
      whatsappNumber: whatsappEnabled ? whatsappNumber || undefined : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Title" name="title" required error={fieldErrors.title}>
        <TextInput
          placeholder="e.g., 18K White Gold Sapphire Ring"
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
          placeholder="Describe the piece: craftsmanship, gemstone details, finish, and any hallmarks..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Field>

      <ImageUploader
        images={images}
        onChange={setImages}
        max={imageLimit.max}
        isPlanLimited={imageLimit.isPlanLimited}
        label="Jewellery Photos"
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
          label="Jewellery Type"
          name="jewelleryType"
          required
          error={fieldErrors.jewelleryType}
        >
          <SelectInput
            value={jewelleryType}
            onChange={(e) => setJewelleryType(e.target.value)}
            required
          >
            <option value="">Select type</option>
            {Object.values(JEWELLERY_TYPE).map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </SelectInput>
        </Field>

        {jewelleryType === JEWELLERY_TYPE.RING && (
          <Field
            label="Ring Size"
            name="ringSize"
            hint="International size or circumference in mm"
            error={fieldErrors.ringSize}
          >
            <TextInput
              placeholder="e.g., 16 or US 7.5"
              value={ringSize}
              onChange={(e) => setRingSize(e.target.value)}
            />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Metal Type"
          name="metalType"
          error={fieldErrors.metalType}
        >
          <SelectInput
            value={metalType}
            onChange={(e) => setMetalType(e.target.value)}
          >
            <option value="">Select metal</option>
            {Object.values(METAL_TYPE).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field
          label="Metal Purity / Hallmark"
          name="metalPurity"
          hint="e.g., 18K, 925, 950"
          error={fieldErrors.metalPurity}
        >
          <TextInput
            placeholder="e.g., 18K"
            value={metalPurity}
            onChange={(e) => setMetalPurity(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Accent Gemstone"
          name="gemType"
          hint="Optional. The main gem set in the piece"
          error={fieldErrors.gemType}
        >
          <SelectInput
            value={gemType}
            onChange={(e) => setGemType(e.target.value)}
          >
            <option value="">None / Not specified</option>
            {Object.values(GEM_TYPE).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field
          label="Total Weight (grams)"
          name="weightGrams"
          hint="Optional"
          error={fieldErrors.weightGrams}
        >
          <TextInput
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 8.5"
            value={weightGrams}
            onChange={(e) => setWeightGrams(e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Origin"
        name="gemOrigin"
        hint="Optional. Country or region where the piece was crafted"
        error={fieldErrors.gemOrigin}
      >
        <TextInput
          placeholder="e.g., Italy, Thailand, Sri Lanka"
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

      <CertificationUploader
        images={certificationImages}
        onChange={setCertificationImages}
        max={certLimit.max}
        isPlanLimited={certLimit.isPlanLimited}
        label="Hallmark / certification documents (optional)"
        hint={`Upload photos of hallmark certificates, gem lab reports, or assay documents. Max ${certLimit.max} images.`}
      />

      <PriceFields
        price={price}
        currency={currency}
        onPriceChange={setPrice}
        onCurrencyChange={setCurrency}
      />

      <Toggle
        checked={negotiable}
        onChange={setNegotiable}
        label="Price is negotiable"
        hint="Buyers will see “Get a Quote” instead of a fixed price."
        onIcon={Handshake}
        offIcon={Tag}
      />

      <Toggle
        checked={isWholesale}
        onChange={setIsWholesale}
        label="List as wholesale"
        hint="For bulk or trade buyers."
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
