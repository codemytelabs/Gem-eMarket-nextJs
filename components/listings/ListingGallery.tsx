"use client";

import { useState } from "react";
import Image from "next/image";
import { cldTransform } from "@/lib/cloudinary-url";

type MediaItem = { type: "image" | "video"; url: string };

export function ListingGallery({
  images,
  reelUrl,
  title,
  isBoosted,
}: {
  images: string[];
  reelUrl: string | null;
  title: string;
  isBoosted: boolean;
}) {
  const media: MediaItem[] = [
    ...(reelUrl ? [{ type: "video" as const, url: reelUrl }] : []),
    ...images.map((url) => ({ type: "image" as const, url })),
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = media[selectedIndex];

  return (
    <div className="space-y-3">
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
        {selected ? (
          selected.type === "video" ? (
            <video
              src={selected.url}
              muted
              loop
              autoPlay
              playsInline
              controls
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={cldTransform(selected.url, "f_auto,q_auto,w_1000")}
              alt={title}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {isBoosted && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`w-20 h-20 shrink-0 relative rounded-lg overflow-hidden bg-gray-100 ${
                i === selectedIndex
                  ? "ring-2 ring-blue-500"
                  : "ring-1 ring-gray-200"
              }`}
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={cldTransform(item.url, "f_auto,q_auto,w_160")}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
