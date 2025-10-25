import { IAd } from "@/types";
import { Suspense } from "react";

// Fetch ads from the API
async function getAds() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ads`, {
    cache: "no-store", // This ensures fresh data on each request (SSR)
  });

  if (!res.ok) {
    throw new Error("Failed to fetch ads");
  }
  return res.json();
}

// Loading carousel
function AdsLoading() {
  const placeholders = [1, 2, 3, 4, 5, 6]; // Number of placeholder slides

  return (
    <div className="overflow-x-auto whitespace-nowrap py-8">
      <div className="flex gap-4 animate-pulse px-4">
        {placeholders.map((num) => (
          <div
            key={num}
            className="min-w-[280px] bg-gray-100 rounded-lg shadow-md h-[320px]"
          >
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ad card component
function AdCard({ ad }: { ad: IAd }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={ad.images[0]}
          alt={ad.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md">
          ${ad.price}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{ad.title}</h3>
        <p className="text-sm text-gray-600 mb-2">Pet type: {ad.petType}</p>
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {ad.description}
        </p>
        <div className="flex justify-between items-center border-t pt-2">
          <div className="text-xs text-gray-500">
            <p>Seller: {ad.seller}</p>
            {/* <p>Posted: {new Date(ad.createdAt).toLocaleDateString()}</p> */}
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

// Ads listing component
async function AdsListing() {
  try {
    const data = await getAds();

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600">
            No pet listings available at the moment
          </h2>
          <p className="mt-2 text-gray-500">
            Check back later or be the first to post a listing!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((ad: IAd) => (
          <AdCard key={ad._id} ad={ad} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading ads:", error);
    return (
      <div className="text-center py-12 text-red-500">
        <h2 className="text-xl font-medium">Unable to load pet listings</h2>
        <p className="mt-2">Please try again later</p>
      </div>
    );
  }
}

// Filter component (simplified)
function AdsFilter() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="font-medium mb-3">Filter Listings</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Pet Type</label>
          <select className="w-full p-2 border rounded">
            <option value="">All Types</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="bird">Birds</option>
            <option value="fish">Fish</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Price Range</label>
          <select className="w-full p-2 border rounded">
            <option value="">Any Price</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500+">$500+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Sort By</label>
          <select className="w-full p-2 border rounded">
            <option value="recent">Most Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function AdsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Pet Marketplace</h1>
      <p className="text-gray-600 mb-6">
        Find your perfect pet companion or list your pets for sale
      </p>

      <AdsFilter />

      <Suspense fallback={<AdsLoading />}>
        <AdsListing />
      </Suspense>
    </div>
  );
}
