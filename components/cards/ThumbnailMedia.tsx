"use client";

import { useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cldTransform } from "@/lib/cloudinary-url";

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
      <div className="absolute inset-0 skeleton-shimmer">
        <Image
          src={cldTransform(images[0], transform)}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover ${className ?? ""}`}
        />
      </div>
    );
  }

  return null;
}
