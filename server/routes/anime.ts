import { RequestHandler } from "express";

const JIKAN_BASE = "https://api.jikan.moe/v4";

function mapAnime(a: any) {
  const images = a.images?.jpg || a.images?.webp || {};
  return {
    id: a.mal_id,
    title: a.title || a.title_english || a.title_japanese,
    image: images.large_image_url || images.image_url || images.small_image_url,
    type: a.type || undefined,
    year: a.year ?? a.aired?.prop?.from?.year ?? null,
    rating: typeof a.score === "number" ? a.score : null,
    subDub: "SUB", // Jikan doesn't provide sub/dub; default to SUB
    genres: Array.isArray(a.genres) ? a.genres.map((g: any) => g.name) : [],
    synopsis: a.synopsis || "",
  };
}

export const getTrending: RequestHandler = async (_req, res) => {
  try {
    const r = await fetch(`${JIKAN_BASE}/top/anime?limit=24`);
    const json = await r.json();
    const results = (json.data || []).map(mapAnime);
    res.json({ results });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to fetch trending" });
  }
};

export const getSearch: RequestHandler = async (req, res) => {
  try {
    const q = String(req.query.q || "");
    if (!q) return res.json({ results: [] });
    const r = await fetch(
      `${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=20&sfw`,
    );
    const json = await r.json();
    const results = (json.data || []).map((a: any) => ({
      mal_id: a.mal_id,
      title: a.title,
      image_url: a.images?.jpg?.image_url || a.images?.jpg?.small_image_url,
      type: a.type,
      year: a.year ?? a.aired?.prop?.from?.year ?? null,
    }));
    res.json({ results });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Search failed" });
  }
};

export const getInfo: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const r = await fetch(`${JIKAN_BASE}/anime/${id}/full`);
    const json = await r.json();
    const data = json.data;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(mapAnime(data));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Info failed" });
  }
};

export const getEpisodes: RequestHandler = async (req, res) => {
  const ALT_BASE = "https://api3.anime-dexter-live.workers.dev";

  function fetchWithTimeout(url: string, opts: any = {}, timeout = 7000) {
    const controller = new AbortController();
    const idT = setTimeout(() => controller.abort(), timeout);
    return fetch(url, { signal: controller.signal, ...opts }).finally(() => clearTimeout(idT));
  }

  async function tryFetchJson(url: string) {
    try {
      const r = await fetchWithTimeout(url, {}, 7000);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      // propagate
      throw e;
    }
  }

  try {
    const id = req.params.id;
    const page = Number(req.query.page || 1);

    // 1) Try dexter API with timeout/retries
    try {
      const altUrl = `${ALT_BASE}/anime/${id}/episodes${page > 1 ? `?page=${page}` : ""}`;
      const jAlt = await tryFetchJson(altUrl);
      const arr = jAlt.data || jAlt.results || jAlt.episodes || null;
      if (Array.isArray(arr) && arr.length > 0) {
        const episodes = arr.map((ep: any) => {
          const number = ep.number ?? ep.episode ?? ep.episode_number ?? ep.ep ?? ep.ep_num ?? null;
          const title = ep.title || ep.name || ep.episodeTitle || ep.title_english || null;
          const air_date = ep.air_date ?? ep.aired ?? ep.date ?? null;
          const eid = ep.id ?? ep.mal_id ?? `${id}-${number ?? "0"}`;
          return {
            id: String(eid),
            number: typeof number === "number" ? number : Number(number) || 0,
            title: title || undefined,
            air_date,
          };
        });
        const pagination = jAlt.pagination || jAlt.meta || null;
        return res.json({ episodes, pagination });
      }
    } catch (e) {
      console.warn("dexter episodes fetch failed", String(e));
    }

    // 2) Try Jikan
    try {
      const jikanUrl = `${JIKAN_BASE}/anime/${id}/episodes?page=${page}`;
      const json = await tryFetchJson(jikanUrl);
      const episodes = (json.data || []).map((ep: any) => ({
        id: String(ep.mal_id ?? `${id}-${ep.episode ?? ''}`),
        number: typeof ep.episode === 'number' ? ep.episode : Number(ep.episode) || 0,
        title: ep.title || ep.title_romanji || ep.title_japanese || undefined,
        air_date: ep.aired || null,
      }));
      const pagination = json.pagination || null;
      if (episodes.length > 0) return res.json({ episodes, pagination });
    } catch (e) {
      console.warn("jikan episodes fetch failed", String(e));
    }

    // 3) Fallback: attempt to fetch basic info and generate numbered episodes if episodes count available
    try {
      const infoUrl = `${JIKAN_BASE}/anime/${id}/full`;
      const inf = await tryFetchJson(infoUrl).catch(() => null);
      const epCount = inf?.data?.episodes ?? null;
      if (typeof epCount === 'number' && epCount > 0) {
        const episodes = Array.from({ length: Math.min(epCount, 200) }).map((_, i) => ({
          id: `${id}-${i + 1}`,
          number: i + 1,
          title: undefined,
          air_date: null,
        }));
        return res.json({ episodes, pagination: { page: 1, has_next_page: epCount > episodes.length } });
      }
    } catch (e) {
      console.warn("fallback info fetch failed", String(e));
    }

    // Nothing available
    return res.json({ episodes: [], pagination: null });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Episodes failed" });
  }
};

// Fetch genres from Jikan and cache in-memory for a few minutes
let genresCache: { at: number; items: { id: number; name: string }[] } | null = null;
async function getGenresList(): Promise<{ id: number; name: string }[]> {
  const now = Date.now();
  if (genresCache && now - genresCache.at < 5 * 60 * 1000) return genresCache.items;
  const r = await fetch(`${JIKAN_BASE}/genres/anime`);
  const json = await r.json();
  const items = (json.data || []).map((g: any) => ({ id: g.mal_id, name: g.name }));
  genresCache = { at: now, items };
  return items;
}

export const getGenres: RequestHandler = async (_req, res) => {
  try {
    const items = await getGenresList();
    res.json({ genres: items });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to fetch genres" });
  }
};

export const getDiscover: RequestHandler = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Math.max(1, Number(req.query.page || 1) || 1);
    const order_by = String(req.query.order_by || "popularity");
    const sort = String(req.query.sort || "desc");
    const genre = String(req.query.genre || "").trim();

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("sfw", "true");
    params.set("limit", "24");
    if (q) params.set("q", q);
    if (order_by) params.set("order_by", order_by);
    if (sort) params.set("sort", sort);

    if (genre) {
      const list = await getGenresList();
      const wanted = list.filter((g) => g.name.toLowerCase() === genre.toLowerCase());
      if (wanted.length > 0) params.set("genres", wanted.map((g) => g.id).join(","));
    }

    const r = await fetch(`${JIKAN_BASE}/anime?${params.toString()}`);
    const json = await r.json();
    const results = (json.data || []).map(mapAnime);
    const pagination = json.pagination || {};
    res.json({
      results,
      pagination: {
        page,
        has_next_page: !!pagination.has_next_page,
        last_visible_page: pagination.last_visible_page ?? null,
        items: pagination.items || null,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Discover failed" });
  }
};

export const getStreaming: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const r = await fetch(`${JIKAN_BASE}/anime/${id}/streaming`);
    const json = await r.json();
    const links = (json.data || []).map((s: any) => ({
      name: s.name,
      url: s.url,
    }));
    res.json({ links });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Streaming providers failed" });
  }
};

// New releases (current season)
export const getNewReleases: RequestHandler = async (_req, res) => {
  try {
    const r = await fetch(`${JIKAN_BASE}/seasons/now`);
    const json = await r.json();
    const results = (json.data || []).map(mapAnime);
    res.json({ results });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to fetch new releases" });
  }
};
