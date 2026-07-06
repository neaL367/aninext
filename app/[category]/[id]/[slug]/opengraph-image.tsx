import { ImageResponse } from "next/og";
import { resolveAnimeDetailMedia } from "@/lib/anilist/server/resolve-anime-detail-media";
import { resolveMangaDetailMedia } from "@/lib/anilist/server/resolve-manga-detail-media";
import { resolveCharacterDetail } from "@/lib/anilist/server/resolve-character-detail";
import { resolveStaffDetail } from "@/lib/anilist/server/resolve-staff-detail";
import { formatDisplayTitle, formatPersonName } from "@/lib/anilist/display/format";

export const alt = "AniNext Media Detail";
export const size = { width: 1200, height: 630 };

type Props = {
  params: {
    category: string;
    id: string;
    slug: string;
  };
};

export default async function generateImage({ params }: Props) {
  const { category, id } = params;
  const numericId = parseInt(id, 10);

  const [boldFont, regularFont] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/Geist-Bold.ttf').then((res) => res.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/Geist-Regular.ttf').then((res) => res.arrayBuffer()),
  ]);

  let title = "Unknown";
  let imageUrl = "";
  let subtext = "";
  let bgColor = "#000000";
  let score = "";

  try {
    if (category === "anime") {
      const media = await resolveAnimeDetailMedia(Promise.resolve({ id: id, slug: "" }));
      title = formatDisplayTitle(media.title);
      imageUrl = media.coverImage?.large ?? "";
      bgColor = media.coverImage?.color ?? "#000000";
      subtext = "Anime";
      score = media.averageScore ? `${media.averageScore}%` : "";
    } else if (category === "manga") {
      const media = await resolveMangaDetailMedia(Promise.resolve({ id: id, slug: "" }));
      title = formatDisplayTitle(media.title);
      imageUrl = media.coverImage?.large ?? "";
      bgColor = media.coverImage?.color ?? "#000000";
      subtext = "Manga";
      score = media.averageScore ? `${media.averageScore}%` : "";
    } else if (category === "character") {
      const character = await resolveCharacterDetail(Promise.resolve({ id: id, slug: "" }));
      title = formatPersonName(character.name);
      imageUrl = character.image?.large ?? "";
      subtext = "Character";
    } else if (category === "staff") {
      const staff = await resolveStaffDetail(Promise.resolve({ id: id, slug: "" }));
      title = formatPersonName(staff.name);
      imageUrl = staff.image?.large ?? "";
      subtext = "Staff";
    }
  } catch (e) {
    console.error("OG Image Generation Error:", e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          backgroundImage: `linear-gradient(to right, ${bgColor} 0%, rgba(0,0,0,0.8) 100%)`,
          padding: "60px",
          fontFamily: "Geist",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "300px",
              height: "450px",
              borderRadius: "20px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "600px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  color: "black",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {subtext}
              </div>
              {score && (
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    opacity: 0.9,
                  }}
                >
                  ⭐ {score}
                </div>
              )}
            </div>
            <h1
              style={{
                fontSize: "72px",
                fontWeight: "800",
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>
            <div
              style={{
                fontSize: "32px",
                opacity: 0.7,
                fontWeight: "500",
              }}
            >
              Discover on AniNext
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Geist',
          data: boldFont,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Geist',
          data: regularFont,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );
}
