"use client";

import { useState } from "react";
import { GEM_TYPE, TREATMENT_STATUS, CERTIFICATION_BODY } from "@/types/enums";
import {
  Field,
  TextInput,
  TextArea,
  SelectInput,
  Toggle,
} from "./shared/FormFields";
import { ImageUploader } from "./shared/ImageUploader";
import { CertificationUploader } from "./shared/CertificationUploader";
import { LocationField } from "./shared/LocationField";
import { PriceFields } from "./shared/PriceFields";
import { SubmitBar } from "./shared/SubmitBar";
import { useCreateListing } from "./shared/useCreateListing";
import { COUNTRIES } from "@/lib/utils/countries";

interface GemFormProps {
  onBack: () => void;
  onSuccess: () => void;
  sellerLocation?: string;
  sellerCountry?: string;
  sellerPhone?: string;
}

export function GemForm({
  onBack,
  onSuccess,
  sellerLocation = "",
  sellerCountry = "LK",
  sellerPhone = "",
}: GemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [isLotSale, setIsLotSale] = useState(false);
  const [lotSize, setLotSize] = useState("");

  const [gemType, setGemType] = useState("");
  const [caratWeight, setCaratWeight] = useState("");

  const [dimL, setDimL] = useState("");
  const [dimW, setDimW] = useState("");
  const [dimH, setDimH] = useState("");

  const [gemOrigin, setGemOrigin] = useState("");
  const [locationCountry, setLocationCountry] = useState(sellerCountry);
  const [locationCity, setLocationCity] = useState(sellerLocation);

  const [treatmentStatus, setTreatmentStatus] = useState("");
  const [certificationBody, setCertificationBody] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [certificationImages, setCertificationImages] = useState<string[]>([]);

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isWholesale, setIsWholesale] = useState(false);

  const [contactPhone, setContactPhone] = useState(sellerPhone);
  const [hideContactPhone, setHideContactPhone] = useState(false);

  const { submit, loading, error } = useCreateListing(onSuccess);

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
      category: "GEM",
      gemType: gemType || undefined,
      caratWeight: caratWeight ? Number(caratWeight) : undefined,
      dimensionL: dimL ? Number(dimL) : undefined,
      dimensionW: dimW ? Number(dimW) : undefined,
      dimensionH: dimH ? Number(dimH) : undefined,
      isLotSale,
      lotSize: isLotSale && lotSize ? Number(lotSize) : undefined,
      gemOrigin: gemOrigin || undefined,
      currentLocation: currentLocation || undefined,
      treatmentStatus: treatmentStatus || undefined,
      certificationBody: certificationBody || undefined,
      certificationNumber: certificationNumber || undefined,
      certificationImages,
      price: price ? Number(price) : undefined,
      currency,
      isWholesale,
      contactPhone: contactPhone || undefined,
      hideContactPhone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Field label="Listing Title" required>
          <TextInput
            placeholder="e.g., 3.5ct Unheated Blue Sapphire — Ratnapura"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Field>

        <Field label="Description" required>
          <TextArea
            rows={4}
            placeholder="Describe the gem's quality, cut style, clarity, fluorescence, and any other notable features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Field>
      </div>

      <ImageUploader
        images={images}
        onChange={setImages}
        max={3}
        label="Gem Photos"
      />

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-4">
        <Toggle
          checked={isLotSale}
          onChange={setIsLotSale}
          label="This is a parcel / lot (multiple stones)"
          hint="Turn on if you are selling a group of stones together."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Gem Type" required>
            <SelectInput
              value={gemType}
              onChange={(e) => setGemType(e.target.value)}
              required
            >
              <option value="">Select gem type</option>
              {Object.values(GEM_TYPE).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </SelectInput>
          </Field>

          {isLotSale ? (
            <Field
              label="Number of Stones"
              required
              hint="Total count in this parcel"
            >
              <TextInput
                type="number"
                min="2"
                step="1"
                placeholder="e.g., 50"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                required
              />
            </Field>
          ) : (
            <Field
              label="Total Carat Weight (ct)"
              required
              hint="Combined weight if multiple; weight of single stone"
            >
              <TextInput
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 3.50"
                value={caratWeight}
                onChange={(e) => setCaratWeight(e.target.value)}
                required
              />
            </Field>
          )}
        </div>

        {isLotSale && (
          <Field
            label="Total Carat Weight (ct)"
            hint="Combined carat weight of the whole parcel"
          >
            <TextInput
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 120.00"
              value={caratWeight}
              onChange={(e) => setCaratWeight(e.target.value)}
            />
          </Field>
        )}
      </div>

      {!isLotSale && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Dimensions (mm){" "}
            <span className="text-xs text-gray-400 font-normal">
              — optional
            </span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Length">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                placeholder="L mm"
                value={dimL}
                onChange={(e) => setDimL(e.target.value)}
              />
            </Field>
            <Field label="Width">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                placeholder="W mm"
                value={dimW}
                onChange={(e) => setDimW(e.target.value)}
              />
            </Field>
            <Field label="Height / Depth">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                placeholder="H mm"
                value={dimH}
                onChange={(e) => setDimH(e.target.value)}
              />
            </Field>
          </div>
          {dimL && dimW && dimH && (
            <p className="mt-1.5 text-xs text-gray-400">
              {dimL} × {dimW} × {dimH} mm
            </p>
          )}
        </div>
      )}

      <Field
        label="Origin of Gem"
        hint="Optional — country or region where the gem was mined"
      >
        <TextInput
          placeholder="e.g., Sri Lanka, Madagascar, Colombia"
          value={gemOrigin}
          onChange={(e) => setGemOrigin(e.target.value)}
        />
      </Field>

      <LocationField
        country={locationCountry}
        city={locationCity}
        onCountryChange={setLocationCountry}
        onCityChange={setLocationCity}
        required
        label="Current Location"
        hint="Where is the gem now?"
        cityPlaceholder="City / Region"
      />

      <Field label="Treatment Status">
        <SelectInput
          value={treatmentStatus}
          onChange={(e) => setTreatmentStatus(e.target.value)}
        >
          <option value="">Select treatment status</option>
          {Object.values(TREATMENT_STATUS).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectInput>
      </Field>

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Certification
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Lab / Certification Body">
            <SelectInput
              value={certificationBody}
              onChange={(e) => setCertificationBody(e.target.value)}
            >
              <option value="">Select lab</option>
              {Object.values(CERTIFICATION_BODY).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Field>

          {certificationBody &&
            certificationBody !== CERTIFICATION_BODY.NONE && (
              <Field label="Certificate Number">
                <TextInput
                  placeholder="e.g., 1234567890"
                  value={certificationNumber}
                  onChange={(e) => setCertificationNumber(e.target.value)}
                />
              </Field>
            )}
        </div>

        <CertificationUploader
          images={certificationImages}
          onChange={setCertificationImages}
          label="Upload lab reports & certificates"
          hint="Photos of GIA, AGL, GRS, or other lab reports. Max 5 images."
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
        hint="Visible to bulk buyers and dealers."
      />

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Contact Preference
        </p>

        <Field
          label="Contact Phone"
          hint="Buyers will see this number on the listing. Leave blank to use your profile number."
        >
          <TextInput
            type="tel"
            placeholder="+94 77 123 4567"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </Field>

        <Toggle
          checked={hideContactPhone}
          onChange={setHideContactPhone}
          label="Hide phone number — receive enquiries through site messages only"
          hint="Your number won't be visible on the listing. Buyers will use the enquiry form."
        />
      </div>

      <SubmitBar loading={loading} error={error} onBack={onBack} />
    </form>
  );
}
