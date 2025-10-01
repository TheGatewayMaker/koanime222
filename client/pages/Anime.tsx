import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import {
  fetchAnimeInfo,
  fetchEpisodes,
  ApiAnimeSummary,
  EpisodeItem,
} from "../lib/anime";
import { toast } from "sonner";

export default function AnimePage() {
  const params = useParams();
  const id = Number(params.id);
  const [info, setInfo] = useState<ApiAnimeSummary | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [i, e] = await Promise.all([
          fetchAnimeInfo(id),
          fetchEpisodes(id),
        ]);
        setInfo(i);
        setEpisodes(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const banner = useMemo(() => info?.image ?? "", [info]);

  return (
    <Layout>
      {loading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="aspect-[16/6] w-full animate-pulse rounded-md bg-muted" />
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : info ? (
        <div>
          <div className="relative">
            <div className="absolute inset-0 -z-10">
              <img
                src={banner}
                alt="banner"
                className="h-full w-full object-cover opacity-30 blur-sm"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background" />
            </div>
            <div className="container mx-auto px-4 py-6 md:py-10">
              <div className="flex flex-col gap-6 md:flex-row">
                <img
                  src={info.image}
                  alt={info.title}
                  className="h-[300px] w-[220px] rounded-md border object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold md:text-4xl">
                    {info.title}
                  </h1>
                  <div className="mt-2 text-sm text-foreground/70">
                    {info.type} {info.year ? `• ${info.year}` : ""}
                    {info.rating != null && (
                      <span className="ml-2 rounded bg-black/30 px-2 py-0.5 text-xs">
                        ⭐ {info.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {info.genres && info.genres.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {info.genres.map((g) => (
                        <span
                          key={g}
                          className="rounded bg-accent px-2 py-1 text-xs"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  {info.synopsis && (
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80">
                      {info.synopsis}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 pb-10">
            <h2 className="mb-3 text-lg font-semibold">Episodes</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {episodes.map((ep) => (
                <button
                  key={ep.id + "-" + ep.number}
                  className="rounded border px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() =>
                    toast("Streaming Error", {
                      description: "Playback is not available yet.",
                      duration: 3000,
                    })
                  }
                >
                  <div className="font-medium">Episode {ep.number}</div>
                  {ep.title && (
                    <div className="line-clamp-1 text-xs text-foreground/60">
                      {ep.title}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-10">Not found</div>
      )}
    </Layout>
  );
}
