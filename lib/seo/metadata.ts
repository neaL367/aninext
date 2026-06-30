import type { Metadata } from "next";

const SITE_NAME = "AniNext";
const SITE_DESCRIPTION =
  "A premium anime discovery platform powered by AniList. Browse trending, seasonal, and airing anime with a fast server-driven experience.";

const METADATA_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
};

/** Root layout only — no canonical/og:url (breaks dynamic child generateMetadata). */
export function createRootLayoutMetadata({
  title,
  description = SITE_DESCRIPTION,
}: Pick<PageMetadataInput, "title" | "description">): Metadata {
  return {
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    metadataBase: METADATA_BASE,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
}: PageMetadataInput): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
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
  const path = `/anime/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export { SITE_NAME, SITE_DESCRIPTION };
