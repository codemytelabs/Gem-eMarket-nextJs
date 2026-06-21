import Image from "next/image";
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
  if (reelUrl) {
    return (
      <video
        src={reelUrl}
        muted
        loop
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${className ?? ""}`}
      />
    );
  }

  if (images[0]) {
    return (
      <Image
        src={cldTransform(images[0], transform)}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  return null;
}
