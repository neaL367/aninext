import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_ANILIST_PORT ?? 3101);
const IMAGE_BASE = "https://s4.anilist.co/file/anilistcdn/media/anime";

function media(id: number, title = `Mock Anime ${id}`) {
  return {
    id,
    title: { romaji: title, english: title, native: title, userPreferred: title },
    coverImage: {
      extraLarge: `${IMAGE_BASE}/cover/extra-large/b${id}.jpg`,
      large: `${IMAGE_BASE}/cover/large/b${id}.jpg`,
      medium: `${IMAGE_BASE}/cover/medium/b${id}.jpg`,
      color: "#3366cc",
    },
    bannerImage: `${IMAGE_BASE}/banner/b${id}.jpg`,
    description: "A mock anime fixture used for deterministic browser tests.",
    averageScore: 80,
    meanScore: 80,
    popularity: 1000 - id,
    favourites: 100,
    format: "TV",
    status: "RELEASING",
    episodes: 24,
    duration: 24,
    season: "SUMMER",
    seasonYear: 2026,
    genres: ["Action", "Adventure"],
    source: "ORIGINAL",
    studios: { nodes: [{ id: 1, name: "Mock Studio", siteUrl: "https://example.test" }] },
    nextAiringEpisode: {
      episode: 2,
      airingAt: Math.floor(Date.now() / 1000) + 3600,
      timeUntilAiring: 3600,
    },
    streamingEpisodes: [],
    trailer: { id: "mock-trailer", site: "youtube", thumbnail: "" },
    externalLinks: [],
  };
}

function collectionMedia(page: number, perPage: number) {
  return Array.from({ length: perPage }, (_, index) => {
    const id = page * 1000 + index + 1;
    return media(id, `Mock Anime ${id}`);
  });
}

function top100Media(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const id = start + index + 1;
    return media(id, `Top 100 Mock Anime ${id}`);
  });
}

function detailMedia(id: number) {
  const item = media(id, id === 21 ? "ONE PIECE" : `Mock Anime ${id}`);
  return {
    ...item,
    characters: {
      edges: [
        {
          role: "MAIN",
          voiceActors: [{ id: 1, name: { full: "Mock Voice Actor" }, image: { medium: "" } }],
          node: { id: 1, name: { full: "Mock Character" }, image: { medium: "" } },
        },
      ],
    },
    staff: {
      edges: [
        {
          role: "Director",
          node: { id: 2, name: { full: "Mock Director" }, image: { medium: "" } },
        },
      ],
    },
    relations: { edges: [{ relationType: "SEQUEL", node: media(id + 1, "Mock Related Anime") }] },
    recommendations: { nodes: [{ mediaRecommendation: media(id + 2, "Mock Recommendation") }] },
    airingSchedule: { nodes: [{ episode: 2, airingAt: Math.floor(Date.now() / 1000) + 3600 }] },
  };
}

function airingSchedules() {
  const item = media(21, "ONE PIECE");
  return [{ episode: 2, airingAt: Math.floor(Date.now() / 1000) + 3600, media: item }];
}

function airingYear(variables: Record<string, unknown>): number {
  return new Date(Number(variables.start ?? 0) * 1000).getUTCFullYear();
}

function responseFor(query: string, variables: Record<string, unknown>) {
  if (query.includes("GenreCollection")) {
    return { GenreCollection: ["Action", "Adventure", "Comedy", "Drama", "Fantasy"] };
  }

  if (query.includes("AnimeFullDetail")) {
    const id = Number(variables.id);
    return { Media: id === 2_000_000_000 ? null : detailMedia(id) };
  }

  if (query.includes("Top100Full")) {
    return {
      page1: { media: top100Media(0, 50) },
      page2: { media: top100Media(50, 50) },
    };
  }

  if (query.includes("HomePrimaryBatch")) {
    return {
      trending: { media: collectionMedia(1, 14) },
      popular: { media: collectionMedia(2, 5) },
    };
  }

  if (query.includes("HomeSecondaryBatch")) {
    return {
      upcoming: { media: collectionMedia(3, 7) },
      alltimepopular: { media: collectionMedia(4, 7) },
      airing: { airingSchedules: airingSchedules() },
    };
  }

  if (query.includes("AiringDay")) {
    const page = Number(variables.page ?? 1);
    const empty = airingYear(variables) === 2099;
    return {
      Page: {
        pageInfo: { hasNextPage: false, total: empty ? 0 : 1 },
        airingSchedules: empty || page !== 1 ? [] : airingSchedules(),
      },
    };
  }

  if (query.includes("BrowseCollection")) {
    const page = Number(variables.page ?? 1);
    const genreIn = variables.genreIn;
    const noResults =
      Array.isArray(genreIn) && genreIn.some((value) => String(value).startsWith("XxX-"));
    return {
      Page: {
        pageInfo: { hasNextPage: !noResults && page < 4, total: noResults ? 0 : 100 },
        media: noResults ? [] : collectionMedia(page, Number(variables.perPage ?? 25)),
      },
    };
  }

  return { Page: { pageInfo: { hasNextPage: false, total: 0 }, media: [] } };
}

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("ok");
    return;
  }

  if (request.method !== "POST") {
    response.writeHead(405);
    response.end();
    return;
  }

  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => {
    try {
      const payload = JSON.parse(body) as {
        query?: string;
        variables?: Record<string, unknown>;
      };
      const data = responseFor(payload.query ?? "", payload.variables ?? {});
      if (payload.query?.includes("AiringDay") && airingYear(payload.variables ?? {}) === 2098) {
        response.writeHead(503, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ errors: [{ message: "Mock AniList outage" }] }));
        return;
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ data }));
    } catch {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ errors: [{ message: "Invalid mock GraphQL request" }] }));
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mock AniList listening on http://127.0.0.1:${PORT}`);
});
