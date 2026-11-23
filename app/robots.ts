import type { MetadataRoute } from "next";

// robots.txt is advisory: it stops the crawlers that respect it, which covers
// the bulk-training ones. Anything that ignores it needs a Vercel Firewall or
// Bot Management rule instead — that cannot be expressed here.
//
// The distinction this file makes: crawlers that send a visitor back (search
// engines, AI answer engines) stay welcome; crawlers that only harvest content
// for training are turned away.
const AI_TRAINING_CRAWLERS = [
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "FacebookBot",
  "cohere-ai",
  "Diffbot",
  "Omgilibot",
  "ImagesiftBot",
  "Timpibot",
  "YouBot",
];

const SEARCH_AND_ANSWER_ENGINES = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "OAI-SearchBot",
  "PerplexityBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: SEARCH_AND_ANSWER_ENGINES, allow: "/" },
      { userAgent: AI_TRAINING_CRAWLERS, disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: "https://ani-next.vercel.app/sitemap.xml",
  };
}
