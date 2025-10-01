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
