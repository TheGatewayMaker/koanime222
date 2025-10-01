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
    const r = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=20&sfw`);
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
  try {
    const id = req.params.id;
    const r = await fetch(`${JIKAN_BASE}/anime/${id}/episodes`);
    const json = await r.json();
    const episodes = (json.data || []).map((ep: any) => ({ id: String(ep.mal_id ?? `${id}-${ep.mal_id ?? ep.episode}`), number: ep.mal_id ?? ep.mal_id ?? ep.episode ?? 0, title: ep.title || ep.title_romanji || ep.title_japanese || undefined, air_date: ep.aired || null }));
    res.json({ episodes });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Episodes failed" });
  }
};
