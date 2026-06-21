import type { Listing } from "@prisma/client";
import type { EditableListing } from "@/components/listings/ListingEditForm";

export function toEditableListing(listing: Listing): EditableListing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    images: listing.images,
    reelUrl: listing.reelUrl,
    category: listing.category,
    price: Number(listing.price),
    currency: listing.currency,
    isWholesale: listing.isWholesale,
    contactPhone: listing.contactPhone,
    hideContactPhone: listing.hideContactPhone,
    gemType: listing.gemType,
    gemOrigin: listing.gemOrigin,
    caratWeight:
      listing.caratWeight !== null ? Number(listing.caratWeight) : null,
    currentLocation: listing.currentLocation,
    treatmentStatus: listing.treatmentStatus,
    certificationBody: listing.certificationBody,
    certificationNumber: listing.certificationNumber,
    certificationImages: listing.certificationImages,
    dimensionL: listing.dimensionL !== null ? Number(listing.dimensionL) : null,
    dimensionW: listing.dimensionW !== null ? Number(listing.dimensionW) : null,
    dimensionH: listing.dimensionH !== null ? Number(listing.dimensionH) : null,
    isLotSale: listing.isLotSale,
    lotSize: listing.lotSize,
    jewelleryType: listing.jewelleryType,
    ringSize: listing.ringSize,
    metalType: listing.metalType,
    metalPurity: listing.metalPurity,
    weightGrams:
      listing.weightGrams !== null ? Number(listing.weightGrams) : null,
    weightSovereigns:
      listing.weightSovereigns !== null
        ? Number(listing.weightSovereigns)
        : null,
    serviceType: listing.serviceType,
    pricingType: listing.pricingType,
    serviceArea: listing.serviceArea,
    turnaroundTime: listing.turnaroundTime,
  };
}
