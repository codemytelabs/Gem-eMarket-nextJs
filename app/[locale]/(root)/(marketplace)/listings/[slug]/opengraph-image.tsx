import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const alt = "Listing preview on Lumevelo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_LABEL: Record<string, string> = {
  GEM: "Certified Gemstone",
  JEWELLERY: "Fine Jewellery",
  PRECIOUS_METAL: "Precious Metal",
  SERVICE: "Gem & Jewellery Service",
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await db.listing.findUnique({
    where: { slug, status: "ACTIVE" },
    select: { title: true, images: true, category: true },
  });

  const title = listing?.title ?? "Lumevelo Listing";
  const image = listing?.images?.[0];
  const categoryLabel = listing
    ? (CATEGORY_LABEL[listing.category] ?? "Listing")
    : "Listing";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0d1b2e",
          fontFamily: "sans-serif",
        }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(13,27,46,0.05) 0%, rgba(13,27,46,0.55) 55%, rgba(13,27,46,0.97) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#1f4e8c",
                color: "white",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              L
            </div>
            <span style={{ color: "white", fontSize: 26, fontWeight: 700 }}>
              Lumevelo
            </span>
          </div>

          <span
            style={{
              display: "flex",
              color: "#fbbf24",
              fontSize: 20,
              fontWeight: 600,
              marginTop: 28,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {categoryLabel}
          </span>

          <div
            style={{
              display: "flex",
              color: "white",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
