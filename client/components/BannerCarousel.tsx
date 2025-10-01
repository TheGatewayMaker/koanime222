import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";

export interface BannerItem {
  id: number;
  title: string;
  image: string;
  description?: string;
  rating?: number | null;
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
      // restart timer on user interaction
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
              className="relative h-[220px] w-full min-w-0 shrink-0 grow-0 basis-full cursor-grab md:h-[380px]"
            >
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute left-0 right-0 top-0 p-4 md:p-6">
                <h3 className="line-clamp-1 text-xl font-bold text-white md:text-3xl">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
