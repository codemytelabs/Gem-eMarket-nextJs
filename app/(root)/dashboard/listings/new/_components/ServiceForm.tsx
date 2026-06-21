"use client";

import { useState } from "react";
import { SERVICE_TYPE, PRICING_TYPE } from "@/types/enums";
import { Field, TextInput, TextArea, SelectInput } from "./shared/FormFields";
import { ImageUploader } from "./shared/ImageUploader";
import { ReelUploader } from "./shared/ReelUploader";
import { LocationField } from "./shared/LocationField";
import { PriceFields } from "./shared/PriceFields";
import { SubmitBar } from "./shared/SubmitBar";
import { useCreateListing } from "./shared/useCreateListing";
import { COUNTRIES } from "@/lib/utils/countries";
import { X } from "lucide-react";

const WORLDWIDE = "Worldwide";

interface ServiceFormProps {
  onBack: () => void;
  onSuccess: () => void;
  sellerLocation?: string;
  sellerCountry?: string;
  sellerPhone?: string;
  canUploadReels: boolean;
  reelsRemaining: number | null;
  reelsMaxPerMonth: number | null;
}

export function ServiceForm({
  onBack,
  onSuccess,
  sellerLocation = "",
  sellerCountry = "LK",
  canUploadReels,
  reelsRemaining,
  reelsMaxPerMonth,
}: ServiceFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [reelUrl, setReelUrl] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [pricingType, setPricingType] = useState(PRICING_TYPE.FIXED);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [turnaroundTime, setTurnaroundTime] = useState("");
  const [locationCountry, setLocationCountry] = useState(sellerCountry);
  const [locationCity, setLocationCity] = useState(sellerLocation);
  const [worldwide, setWorldwide] = useState(false);
  const [areaInput, setAreaInput] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);

  const { submit, loading, error, fieldErrors } = useCreateListing(onSuccess);

  const addArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !serviceAreas.includes(trimmed)) {
      setServiceAreas((prev) => [...prev, trimmed]);
    }
    setAreaInput("");
  };

  const removeArea = (area: string) => {
    setServiceAreas((prev) => prev.filter((a) => a !== area));
  };

  const serviceArea = worldwide ? [WORLDWIDE] : serviceAreas;

  const priceLabel: Record<PRICING_TYPE, string> = {
    [PRICING_TYPE.FIXED]: "Price",
    [PRICING_TYPE.STARTING_FROM]: "Starting Price",
    [PRICING_TYPE.NEGOTIABLE]: "Reference Price",
    [PRICING_TYPE.PER_HOUR]: "Hourly Rate",
    [PRICING_TYPE.PER_ITEM]: "Price per Item",
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
      category: "SERVICE",
      serviceType: serviceType || undefined,
      pricingType,
      price: price ? Number(price) : undefined,
      currency,
      turnaroundTime: turnaroundTime || undefined,
      currentLocation: currentLocation || undefined,
      serviceArea,
      isWholesale: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        label="Service Title"
        name="title"
        required
        error={fieldErrors.title}
      >
        <TextInput
          placeholder="e.g., Professional Gem Cutting & Polishing"
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
          placeholder="Describe your service, experience, equipment, and what clients can expect..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Field>

      <ImageUploader
        images={images}
        onChange={setImages}
        max={6}
        label="Portfolio / Sample Photos"
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
          label="Service Type"
          name="serviceType"
          required
          error={fieldErrors.serviceType}
        >
          <SelectInput
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            required
          >
            <option value="">Select service type</option>
            {Object.values(SERVICE_TYPE).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field
          label="Pricing Type"
          name="pricingType"
          required
          error={fieldErrors.pricingType}
        >
          <SelectInput
            value={pricingType}
            onChange={(e) => setPricingType(e.target.value as PRICING_TYPE)}
            required
          >
            {Object.values(PRICING_TYPE).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <PriceFields
        price={price}
        currency={currency}
        onPriceChange={setPrice}
        onCurrencyChange={setCurrency}
        label={priceLabel[pricingType as PRICING_TYPE] ?? "Price"}
      />

      <Field
        label="Typical Turnaround Time"
        name="turnaroundTime"
        hint="Optional — give buyers an idea of lead time"
        error={fieldErrors.turnaroundTime}
      >
        <TextInput
          placeholder="e.g., 2–5 business days"
          value={turnaroundTime}
          onChange={(e) => setTurnaroundTime(e.target.value)}
        />
      </Field>

      <LocationField
        country={locationCountry}
        city={locationCity}
        onCountryChange={setLocationCountry}
        onCityChange={setLocationCity}
        label="Workshop / Shop Location"
        cityPlaceholder="City / Region"
      />

      {/* Service area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Service Area <span className="text-red-500">*</span>
        </label>

        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={worldwide}
            onChange={(e) => {
              setWorldwide(e.target.checked);
              if (e.target.checked) setServiceAreas([]);
            }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Worldwide — I can serve clients globally
          </span>
        </label>

        {!worldwide && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArea();
                  }
                }}
                placeholder="Type a city or country, then press Enter"
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addArea}
                disabled={!areaInput.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {serviceAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => removeArea(area)}
                      className="ml-0.5 hover:text-green-900 dark:hover:text-green-200"
                      aria-label={`Remove ${area}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {serviceAreas.length === 0 && (
              <p className="text-xs text-amber-600">
                Add at least one area or check &ldquo;Worldwide&rdquo; above.
              </p>
            )}
          </div>
        )}
      </div>

      <SubmitBar
        loading={loading}
        error={error}
        onBack={onBack}
        submitLabel="Publish Service"
      />
    </form>
  );
}
