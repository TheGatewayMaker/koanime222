export interface ApiAnimeSummary {
  id: number;
  title: string;
  image: string;
  type?: string;
  year?: number | null;
  rating?: number | null;
  subDub?: "SUB" | "DUB" | "SUB/DUB" | null;
  genres?: string[];
  synopsis?: string;
}

export async function fetchTrending(): Promise<ApiAnimeSummary[]> {
  try {
    const res = await fetch("/api/anime/trending");
    if (!res.ok) {
      console.error("fetchTrending failed", res.status, await res.text().catch(() => ""));
      return [];
    }
    const data = await res.json();
    return data.results as ApiAnimeSummary[];
  } catch (e) {
    console.error("fetchTrending error", e);
    return [];
  }
}

export interface DiscoverParams {
  q?: string;
  genre?: string;
  page?: number;
  order_by?: string;
  sort?: "asc" | "desc";
}
export interface DiscoverResponse {
  results: ApiAnimeSummary[];
  pagination: { page: number; has_next_page: boolean; last_visible_page: number | null };
}
export async function fetchDiscover(params: DiscoverParams = {}): Promise<DiscoverResponse> {
  try {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.genre) qs.set("genre", params.genre);
    if (params.page) qs.set("page", String(params.page));
    if (params.order_by) qs.set("order_by", params.order_by);
    if (params.sort) qs.set("sort", params.sort);
    const res = await fetch(`/api/anime/discover?${qs.toString()}`);
    if (!res.ok) {
      console.error("fetchDiscover failed", res.status, await res.text().catch(() => ""));
      return { results: [], pagination: { page: params.page || 1, has_next_page: false, last_visible_page: null } };
    }
    return await res.json();
  } catch (e) {
    console.error("fetchDiscover error", e);
    return { results: [], pagination: { page: params.page || 1, has_next_page: false, last_visible_page: null } };
  }
}

export interface GenreItem { id: number; name: string }
export async function fetchGenres(): Promise<GenreItem[]> {
  try {
    const res = await fetch("/api/anime/genres");
    if (!res.ok) {
      console.error("fetchGenres failed", res.status, await res.text().catch(() => ""));
      return [];
    }
    const data = await res.json();
    return data.genres as GenreItem[];
  } catch (e) {
    console.error("fetchGenres error", e);
    return [];
  }
}

export interface StreamLink { name: string; url: string }
export async function fetchStreams(id: number): Promise<StreamLink[]> {
  try {
    const res = await fetch(`/api/anime/streams/${id}`);
    if (!res.ok) {
      console.error("fetchStreams failed", res.status, await res.text().catch(() => ""));
      return [];
    }
    const data = await res.json();
    return data.links as StreamLink[];
  } catch (e) {
    console.error("fetchStreams error", e);
    return [];
  }
}

export async function fetchNewReleases(): Promise<ApiAnimeSummary[]> {
  try {
    const res = await fetch("/api/anime/new");
    if (!res.ok) {
      console.error("fetchNewReleases failed", res.status, await res.text().catch(() => ""));
      return [];
    }
    const data = await res.json();
    return data.results as ApiAnimeSummary[];
  } catch (e) {
    console.error("fetchNewReleases error", e);
    return [];
  }
}

export async function fetchAnimeInfo(id: number): Promise<ApiAnimeSummary | null> {
  try {
    const res = await fetch(`/api/anime/info/${id}`);
    if (!res.ok) {
      console.error("fetchAnimeInfo failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("fetchAnimeInfo error", e);
    return null;
  }
}

export interface EpisodeItem {
  id: string;
  number: number;
  title?: string;
  air_date?: string | null;
}
export interface EpisodesResponse {
  episodes: EpisodeItem[];
  pagination?: { has_next_page?: boolean; last_visible_page?: number | null; items?: any } | null;
}
export async function fetchEpisodes(id: number, page = 1): Promise<EpisodesResponse> {
  const ALT_BASE = "https://api3.anime-dexter-live.workers.dev";
  // Try server endpoint first
  try {
    const res = await fetch(`/api/anime/episodes/${id}?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      return normalizeEpisodesResponse(data);
    }
    console.warn("server episodes returned non-ok", res.status);
  } catch (e) {
    console.warn("server episodes fetch failed", e);
  }

  // Fallback: try dexter directly from client (CORS allowing)
  try {
    const dexterUrl = `${ALT_BASE}/anime/${id}/episodes${page > 1 ? `?page=${page}` : ""}`;
    const r = await fetch(dexterUrl);
    if (r.ok) {
      const j = await r.json();
      return normalizeEpisodesResponse({ episodes: j.data || j.results || j.episodes || j });
    }
    console.warn("dexter direct returned non-ok", r.status);
  } catch (e) {
    console.warn("dexter direct fetch failed", e);
  }

  // Final fallback: try Jikan directly
  try {
    const jikanUrl = `https://api.jikan.moe/v4/anime/${id}/episodes?page=${page}`;
    const rj = await fetch(jikanUrl);
    if (rj.ok) {
      const j = await rj.json();
      return normalizeEpisodesResponse({ episodes: j.data || j.episodes || [] , pagination: j.pagination || null});
    }
    console.warn("jikan direct returned non-ok", rj.status);
  } catch (e) {
    console.warn("jikan direct fetch failed", e);
  }

  return { episodes: [], pagination: null };
}

function normalizeEpisodesResponse(data: any): EpisodesResponse {
  const episodes = (data.episodes || data.results || data.data || []).map((ep: any) => {
    const number = ep.number ?? ep.episode ?? ep.episode_number ?? ep.ep ?? ep.ep_num ?? ep.mal_id ?? null;
    const title = ep.title || ep.name || ep.episodeTitle || ep.title_english || undefined;
    const air_date = ep.air_date ?? ep.aired ?? ep.date ?? null;
    const id = ep.id ?? ep.mal_id ?? `${ep.mal_id ?? ''}-${number ?? ''}`;
    return {
      id: String(id),
      number: typeof number === 'number' ? number : Number(number) || 0,
      title,
      air_date,
    };
  });

  // Normalize pagination to include last_visible_page if possible
  const pagination = data.pagination || data.meta || null;
  if (pagination && typeof pagination === 'object') {
    const last = pagination.last_visible_page ?? pagination.last_page ?? pagination.total_pages ?? pagination.totalPages ?? null;
    return { episodes, pagination: { ...pagination, last_visible_page: last } };
  }
  return { episodes, pagination: null };
}
