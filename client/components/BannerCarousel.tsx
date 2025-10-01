import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

export interface BannerItem {
  id: number;
  title: string;
  image: string;
  description?: string;
  rating?: number | null;
  subDub?: string | null;
  year?: number | null;
  type?: string | null;
}

export function BannerCarousel({ items }: { items: BannerItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", skipSnaps: false });
  const timerRef = useRef<number | null>(null);
  const isHovering = useRef(false);

  const play = useCallback(() => {
    if (!emblaApi) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!isHovering.current) emblaApi.scrollNext();
    }, 4000) as unknown as number;
  }, [emblaApi]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    play();
    const onSelect = () => {
      stop();
      play();
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", () => {
      isHovering.current = true;
      stop();
    });
    emblaApi.on("pointerUp", () => {
      isHovering.current = false;
      play();
    });
    return () => stop();
  }, [emblaApi, play, stop]);

  return (
    <div className="relative" onMouseEnter={() => (isHovering.current = true)} onMouseLeave={() => (isHovering.current = false)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/anime/${item.id}`}
              className="relative h-[220px] w-full min-w-0 shrink-0 grow-0 basis-full cursor-grab md:h-[380px] md:basis-full md:min-w-full px-4 md:px-0"
            >
              <div className="relative h-full w-full rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover brightness-75 transition-transform duration-300"
                />

                {/* dark overlay to improve readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                {/* full-width bottom info bar, softer darkness to not obscure image */}
                <div className="absolute left-0 right-0 bottom-0 p-4 md:p-6">
                  <div className="w-full rounded-none bg-black/25 p-3 backdrop-blur-sm shadow-sm">
                    <h3 className="line-clamp-1 text-lg font-bold text-white md:text-3xl">{item.title}</h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/90">
                      {item.rating != null && (
                        <span className="rounded bg-black/40 px-2 py-1">⭐ {item.rating.toFixed(1)}</span>
                      )}
                      {item.subDub && <span className="rounded bg-black/40 px-2 py-1">{item.subDub}</span>}
                      {item.type && <span className="rounded bg-black/40 px-2 py-1">{item.type}</span>}
                      {item.year && <span className="rounded bg-black/40 px-2 py-1">{item.year}</span>}
                    </div>

                    {item.description && (
                      <p className="mt-2 max-w-2xl line-clamp-2 text-sm text-white/80">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
