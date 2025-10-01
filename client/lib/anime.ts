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
  const res = await fetch("/api/anime/trending");
  if (!res.ok) throw new Error("Failed to fetch trending");
  const data = await res.json();
  return data.results as ApiAnimeSummary[];
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
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.genre) qs.set("genre", params.genre);
  if (params.page) qs.set("page", String(params.page));
  if (params.order_by) qs.set("order_by", params.order_by);
  if (params.sort) qs.set("sort", params.sort);
  const res = await fetch(`/api/anime/discover?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch discover");
  return await res.json();
}

export interface GenreItem { id: number; name: string }
export async function fetchGenres(): Promise<GenreItem[]> {
  const res = await fetch("/api/anime/genres");
  if (!res.ok) throw new Error("Failed to fetch genres");
  const data = await res.json();
  return data.genres as GenreItem[];
}

export interface StreamLink { name: string; url: string }
export async function fetchStreams(id: number): Promise<StreamLink[]> {
  const res = await fetch(`/api/anime/streams/${id}`);
  if (!res.ok) throw new Error("Failed to fetch streams");
  const data = await res.json();
  return data.links as StreamLink[];
}

export async function fetchAnimeInfo(id: number): Promise<ApiAnimeSummary> {
  const res = await fetch(`/api/anime/info/${id}`);
  if (!res.ok) throw new Error("Failed to fetch info");
  return await res.json();
}

export interface EpisodeItem {
  id: string;
  number: number;
  title?: string;
  air_date?: string | null;
}
export async function fetchEpisodes(id: number): Promise<EpisodeItem[]> {
  const res = await fetch(`/api/anime/episodes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch episodes");
  const data = await res.json();
  return data.episodes as EpisodeItem[];
}
