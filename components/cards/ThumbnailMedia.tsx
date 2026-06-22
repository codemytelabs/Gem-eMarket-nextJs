"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cldTransform } from "@/lib/cloudinary-url";

const SLIDESHOW_INTERVAL_MS = 3000;

export function ThumbnailMedia({
  images,
  reelUrl,
  alt,
  transform,
  className,
}: {
  images: string[];
  reelUrl?: string | null;
  alt: string;
  transform: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const startSlideshow = () => {
    if (images.length <= 1 || intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setSlideIndex((i) => (i + 1) % images.length);
    }, SLIDESHOW_INTERVAL_MS);
  };

  const stopSlideshow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSlideIndex(0);
  };

  useEffect(() => () => stopSlideshow(), []);

  if (reelUrl) {
    return (
      <div
        className="absolute inset-0 skeleton-shimmer"
        onMouseEnter={() => videoRef.current?.play()}
        onMouseLeave={() => videoRef.current?.pause()}
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) video.play();
          else video.pause();
        }}
      >
        <video
          ref={videoRef}
          src={cldTransform(reelUrl, "q_auto,ac_none,w_400")}
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover ${className ?? ""}`}
        />
        <div className="absolute bottom-1.5 right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-black/50 pointer-events-none">
          <Play className="w-2.5 h-2.5 text-white" fill="currentColor" />
        </div>
      </div>
    );
  }

  if (images[0]) {
    return (
      <div
        className="absolute inset-0 skeleton-shimmer"
        onMouseEnter={startSlideshow}
        onMouseLeave={stopSlideshow}
      >
        <Image
          src={cldTransform(images[slideIndex] ?? images[0], transform)}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover ${className ?? ""}`}
        />
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 pointer-events-none">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  i === slideIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
