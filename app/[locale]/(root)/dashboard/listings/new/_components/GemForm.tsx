"use client";

import { useState } from "react";
import { Handshake, Tag } from "lucide-react";
import {
  GEM_TYPE,
  TREATMENT_STATUS,
  CERTIFICATION_BODY,
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

interface GemFormProps {
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

export function GemForm({
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
}: GemFormProps) {
  const imageLimit = getEffectiveLimit(CATEGORY_IMAGE_MAX.GEM, planMaxImages);
  const certLimit = getEffectiveLimit(
    CERTIFICATION_IMAGE_MAX,
    planMaxCertificationImages,
  );
  const [title, setTitle] = useState("");
  const [reelUrl, setReelUrl] = useState("");
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
      pricingType: negotiable ? PRICING_TYPE.NEGOTIABLE : undefined,
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
            placeholder="e.g., 3.5ct Unheated Blue Sapphire, Ratnapura"
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
        max={imageLimit.max}
        isPlanLimited={imageLimit.isPlanLimited}
        label="Gem Photos"
        required={!reelUrl}
      />

      <ReelUploader
        value={reelUrl}
        onChange={setReelUrl}
        canUpload={canUploadReels}
        remaining={reelsRemaining}
        maxPerMonth={reelsMaxPerMonth}
      />

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-4">
        <Toggle
          checked={isLotSale}
          onChange={setIsLotSale}
          label="This is a parcel / lot (multiple stones)"
          hint="Turn on if you are selling a group of stones together."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Gem Type"
            name="gemType"
            required
            error={fieldErrors.gemType}
          >
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
              name="lotSize"
              required
              hint="Total count in this parcel"
              error={fieldErrors.lotSize}
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
              name="caratWeight"
              required
              hint="Combined weight if multiple; weight of single stone"
              error={fieldErrors.caratWeight}
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
            name="caratWeight"
            hint="Combined carat weight of the whole parcel"
            error={fieldErrors.caratWeight}
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
              (optional)
            </span>
          </p>
          <div className="grid grid-cols-2 min-[500px]:grid-cols-3 gap-3">
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
            <div className="col-span-2 min-[500px]:col-span-1">
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
        name="gemOrigin"
        hint="Optional. Country or region where the gem was mined"
        error={fieldErrors.gemOrigin}
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

      <Field
        label="Treatment Status"
        name="treatmentStatus"
        error={fieldErrors.treatmentStatus}
      >
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
          <Field
            label="Lab / Certification Body"
            name="certificationBody"
            error={fieldErrors.certificationBody}
          >
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
              <Field
                label="Certificate Number"
                name="certificationNumber"
                error={fieldErrors.certificationNumber}
              >
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
          max={certLimit.max}
          isPlanLimited={certLimit.isPlanLimited}
          label="Upload lab reports & certificates"
          hint={`Photos of GIA, AGL, GRS, or other lab reports. Max ${certLimit.max} images.`}
        />
      </div>

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
        hint="Visible to bulk buyers and dealers."
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
