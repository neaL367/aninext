import type { Metadata } from "next";

const SITE_NAME = "AniNext";
const SITE_DESCRIPTION =
  "A premium anime discovery platform powered by AniList. Browse trending, seasonal, and airing anime with a fast server-driven experience.";

const METADATA_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type PageMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
};

function getDynamicOgUrl(title: string, description: string): string {
  const params = new URLSearchParams({
    title: title,
    description: description,
  });
  return `${METADATA_BASE}/api/og?${params.toString()}`;
}

/** Root layout only — no canonical/og:url (breaks dynamic child generateMetadata). */
export function createRootLayoutMetadata({
  title,
  description = SITE_DESCRIPTION,
}: Pick<PageMetadataInput, "title" | "description">): Metadata {
  const ogImage = getDynamicOgUrl(title, description);

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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image,
}: PageMetadataInput): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const ogImage = image ?? getDynamicOgUrl(title, description);

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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function createDetailMetadata(
  title: string,
  description: string,
  path: string,
  image?: string | null,
): Metadata {
  return createPageMetadata({ title, description, path, image });
}
