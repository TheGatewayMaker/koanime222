import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { BannerCarousel } from "../components/BannerCarousel";
import { AnimeCard } from "../components/AnimeCard";
import { fetchTrending } from "../lib/anime";

export default function Index() {
  const [banner, setBanner] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const trend = await fetchTrending();
        setBanner(
          trend
            .slice(0, 10)
            .map((t) => ({
              id: t.id,
              title: t.title,
              image: t.image,
              description: t.synopsis,
              rating: t.rating,
            })),
        );
        setTrending(trend);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layout>
      <section className="relative">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <BannerCarousel items={banner} />
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold md:text-2xl">Trending Now</h2>
          <a href="/discover" className="text-sm text-primary hover:underline">
            See all
          </a>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {trending.map((a) => (
              <AnimeCard key={a.id} anime={a} />
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <div className="rounded-md border p-4 md:p-6">
          <h3 className="mb-3 text-base font-semibold md:text-lg">
            Browse by Genre
          </h3>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <a
                key={g}
                href={`/discover?genre=${encodeURIComponent(g)}`}
                className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
              >
                {g}
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Sci-Fi",
  "Slice of Life",
  "Mystery",
  "Romance",
  "Horror",
  "Supernatural",
  "Sports",
  "Mecha",
  "Music",
  "Psychological",
  "Thriller",
  "Ecchi",
  "Isekai",
  "Martial Arts",
  "Military",
  "Historical",
  "School",
  "Seinen",
  "Shoujo",
  "Shounen",
  "Josei",
];
