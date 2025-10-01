import { Link } from "react-router-dom";

export interface BannerItem {
  id: number;
  title: string;
  image: string;
  description?: string;
  rating?: number | null;
}

export function BannerCarousel({ items }: { items: BannerItem[] }) {
  return (
    <div className="relative">
      <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/anime/${item.id}`}
            className="group relative h-[200px] w-[85%] min-w-[85%] rounded-md border md:h-[360px] md:w-[60%] md:min-w-[60%]"
          >
            <img src={item.image} alt={item.title} className="h-full w-full rounded-md object-cover" />
            <div className="absolute inset-0 rounded-md bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="flex items-center gap-2 text-xs text-white/80">
                {item.rating != null && <span className="rounded bg-black/70 px-2 py-1">⭐ {item.rating.toFixed(1)}</span>}
              </div>
              <h3 className="mt-2 line-clamp-1 text-lg font-semibold text-white md:text-2xl">{item.title}</h3>
              {item.description && (
                <p className="mt-1 hidden line-clamp-2 text-sm text-white/80 md:block">{item.description}</p>
              )}
              <span className="mt-3 inline-flex rounded bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Watch now</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
