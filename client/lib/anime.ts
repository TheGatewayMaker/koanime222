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
  try {
    const res = await fetch(`/api/anime/episodes/${id}?page=${page}`);
    if (!res.ok) {
      console.error("fetchEpisodes failed", res.status, await res.text().catch(() => ""));
      return { episodes: [], pagination: null };
    }
    const data = await res.json();
    return data as EpisodesResponse;
  } catch (e) {
    console.error("fetchEpisodes error", e);
    return { episodes: [], pagination: null };
  }
}
