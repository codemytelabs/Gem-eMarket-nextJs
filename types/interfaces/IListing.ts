import {
  LISTING_CATEGORY,
  GEM_TYPE,
  TREATMENT_STATUS,
  CERTIFICATION_BODY,
  JEWELLERY_TYPE,
  SERVICE_TYPE,
  PRICING_TYPE,
  METAL_PURITY,
} from "../enums";

export interface IListing {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: LISTING_CATEGORY;
  gemType?: GEM_TYPE;
  gemOrigin?: string;
  caratWeight?: number;
  treatmentStatus?: TREATMENT_STATUS;
  certificationBody?: CERTIFICATION_BODY;
  certificationNumber?: string;
  certificationImages?: string[];
  currentLocation?: string;
  // Gem dimensions
  dimensionL?: number;
  dimensionW?: number;
  dimensionH?: number;
  // Gem parcel
  isLotSale?: boolean;
  lotSize?: number;
  // Contact
  contactPhone?: string;
  hideContactPhone?: boolean;
  metalType?: string;
  metalPurity?: METAL_PURITY | string;
  weightSovereigns?: number;
  weightGrams?: number;
  // Jewellery
  jewelleryType?: JEWELLERY_TYPE;
  ringSize?: string;
  // Services
  serviceType?: SERVICE_TYPE;
  pricingType?: PRICING_TYPE;
  serviceArea?: string[];
  turnaroundTime?: string;
  status: "ACTIVE" | "SOLD" | "PAUSED" | "PENDING_REVIEW" | "REJECTED";
  isWholesale: boolean;
  isBoosted: boolean;
  boostEndAt?: Date;
  isFeaturedHomepage: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  seller?: ISellerPublic;
}

export interface ISellerPublic {
  id: string;
  name: string;
  shopSlug?: string;
  avatarUrl?: string;
  isVerified: boolean;
  locationCity?: string;
  specialties: string[];
  planName: string;
}
