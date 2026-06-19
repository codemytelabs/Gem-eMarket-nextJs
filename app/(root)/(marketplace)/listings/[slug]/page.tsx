import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, MessageSquare, Clock, Globe } from "lucide-react";
import EnquiryModal from "./_components/EnquiryModal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await db.listing.findUnique({
    where: { slug },
    select: {
      metaTitle: true,
      metaDescription: true,
      images: true,
      title: true,
    },
  });

  if (!listing) return { title: "Not Found" };

  return {
    title: listing.metaTitle ?? listing.title,
    description: listing.metaDescription ?? undefined,
    openGraph: {
      title: listing.metaTitle ?? listing.title,
      description: listing.metaDescription ?? undefined,
      images: listing.images[0] ? [{ url: listing.images[0] }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.metaTitle ?? listing.title,
      description: listing.metaDescription ?? undefined,
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;

  const listing = await db.listing.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          shopSlug: true,
          avatarUrl: true,
          isVerified: true,
          locationCity: true,
          specialties: true,
          whatsappNumber: true,
          subscription: { select: { plan: { select: { name: true } } } },
        },
      },
    },
  });

  if (!listing) notFound();

  const seller = {
    ...listing.seller,
    planName: listing.seller.subscription?.plan.name ?? "free",
  };

  // JSON-LD schema
  const jsonLd = listing.schemaMarkup ?? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images,
    brand: { "@type": "Brand", name: "GemCeylon" },
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: seller.name },
      areaServed: "Worldwide",
    },
    additionalProperty: [
      listing.gemOrigin && {
        "@type": "PropertyValue",
        name: "Origin",
        value: listing.gemOrigin,
      },
      listing.caratWeight && {
        "@type": "PropertyValue",
        name: "Carat Weight",
        value: String(listing.caratWeight),
      },
      listing.treatmentStatus && {
        "@type": "PropertyValue",
        name: "Treatment",
        value: listing.treatmentStatus,
      },
      listing.certificationBody && {
        "@type": "PropertyValue",
        name: "Certified By",
        value: listing.certificationBody,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Images */}
          <div className="lg:col-span-3 space-y-3">
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              {listing.isBoosted && (
                <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 shrink-0 relative rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                {listing.category}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.title}
              </h1>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {listing.currency} {Number(listing.price).toLocaleString()}
              </p>
            </div>

            {/* Category-specific details */}
            <CategoryDetails listing={listing} />

            {/* Certification images (all categories) */}
            {listing.certificationImages?.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  Certification Documents
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {listing.certificationImages.map((src: string, i: number) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity">
                        <Image
                          src={src}
                          alt={`Certificate ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Seller card */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {seller.name}
                    </span>
                    {seller.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  {seller.locationCity && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {seller.locationCity}, Sri Lanka
                    </div>
                  )}
                </div>
              </div>

              {seller.shopSlug && (
                <Link
                  href={`/shop/${seller.shopSlug}`}
                  className="block text-center text-xs font-medium text-blue-600 hover:underline mb-3"
                >
                  View shop profile →
                </Link>
              )}

              {/* Enquiry button — opens modal */}
              <EnquiryModal
                listingId={listing.id}
                listingTitle={listing.title}
              />

              {/* WhatsApp direct (if seller has it) */}
              {seller.whatsappNumber && (
                <a
                  href={`https://wa.me/${seller.whatsappNumber.replace(/\D/g, "")}?text=Hi, I saw your listing "${listing.title}" on GemCeylon.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm font-semibold rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp seller
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Category-specific detail grids ─────────────────────────────────────────

function DetailGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
      {children}
    </div>
  );
}

function DetailCell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CategoryDetails({ listing }: { listing: any }) {
  const category: string = listing.category;

  if (category === "GEM") {
    return (
      <DetailGrid>
        <DetailCell label="Gem Type" value={listing.gemType} />
        <DetailCell
          label="Carat Weight"
          value={
            listing.caratWeight ? `${Number(listing.caratWeight)} ct` : null
          }
        />
        <DetailCell label="Origin" value={listing.gemOrigin} />
        <DetailCell label="Current Location" value={listing.currentLocation} />
        <DetailCell label="Treatment" value={listing.treatmentStatus} />
        <DetailCell label="Certified By" value={listing.certificationBody} />
        <DetailCell label="Certificate #" value={listing.certificationNumber} />
      </DetailGrid>
    );
  }

  if (category === "JEWELLERY") {
    return (
      <DetailGrid>
        <DetailCell label="Type" value={listing.jewelleryType} />
        <DetailCell
          label="Metal"
          value={
            [listing.metalType, listing.metalPurity]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
        <DetailCell label="Accent Gemstone" value={listing.gemType} />
        <DetailCell
          label="Weight"
          value={
            listing.weightGrams ? `${Number(listing.weightGrams)} g` : null
          }
        />
        <DetailCell label="Ring Size" value={listing.ringSize} />
        <DetailCell label="Location" value={listing.currentLocation} />
      </DetailGrid>
    );
  }

  if (category === "PRECIOUS_METAL") {
    return (
      <DetailGrid>
        <DetailCell label="Metal Type" value={listing.metalType} />
        <DetailCell label="Purity" value={listing.metalPurity} />
        <DetailCell
          label="Weight"
          value={
            listing.weightGrams ? `${Number(listing.weightGrams)} g` : null
          }
        />
        <DetailCell label="Current Location" value={listing.currentLocation} />
        <DetailCell label="Certificate #" value={listing.certificationNumber} />
      </DetailGrid>
    );
  }

  if (category === "SERVICE") {
    const areaLabel =
      listing.serviceArea?.length > 0
        ? listing.serviceArea.join(", ")
        : (listing.currentLocation ?? null);

    return (
      <DetailGrid>
        <DetailCell label="Service Type" value={listing.serviceType} />
        <DetailCell label="Pricing" value={listing.pricingType} />
        <DetailCell
          label="Turnaround Time"
          value={
            listing.turnaroundTime ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {listing.turnaroundTime}
              </span>
            ) : null
          }
        />
        <DetailCell
          label="Service Area"
          value={
            areaLabel ? (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                {areaLabel}
              </span>
            ) : null
          }
        />
        <DetailCell label="Workshop Location" value={listing.currentLocation} />
      </DetailGrid>
    );
  }

  return null;
}
