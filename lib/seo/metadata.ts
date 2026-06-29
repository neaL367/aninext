import type { Metadata } from "next";

const SITE_NAME = "AniNext";
const SITE_DESCRIPTION =
  "A premium anime discovery platform powered by AniList. Browse trending, seasonal, and airing anime with a fast server-driven experience.";

type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
};

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
}: PageMetadataInput): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;

  return {
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function createDetailMetadata(
  title: string,
  description: string,
  id: number
): Metadata {
  return createPageMetadata({
    title,
    description,
    path: `/anime/${id}`,
  });
}

export { SITE_NAME, SITE_DESCRIPTION };
