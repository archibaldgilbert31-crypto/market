import { Heart, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

const ACTIONS_W = 168;

type Props = {
  children: ReactNode;
  onFavorite: () => void;
  onDelete: () => void;
  /** Режим кнопки слева: избранное (сердечко) или «В корзину» (плюс) */
  swipeAction?: "favorite" | "addToCart";
  inFavorites?: boolean;
  swipeKey?: string | number;
};

export function SwipeRevealRow({
  children,
  onFavorite,
  onDelete,
  swipeAction = "favorite",
  inFavorites = false,
  swipeKey,
}: Props) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startT = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (swipeKey !== undefined) setTranslateX(0);
  }, [swipeKey]);

  const snapClosed = () => setTranslateX(0);

  const handlePointerEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    setTranslateX((t) => (t < -ACTIONS_W / 2 ? -ACTIONS_W : 0));
  };

  const runFavorite = () => {
    onFavorite();
    snapClosed();
  };

  const runDelete = () => {
    onDelete();
    snapClosed();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white isolate">
      <div
        className="absolute inset-y-0 right-0 z-0 flex overflow-hidden"
        style={{ width: ACTIONS_W }}
        aria-hidden
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            runFavorite();
          }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-emerald-50 text-[var(--fresh-green)] border-l border-emerald-100/80 active:bg-emerald-100 min-w-0"
        >
          {swipeAction === "addToCart" ? (
            <Plus size={22} strokeWidth={2.5} />
          ) : (
            <Heart size={20} className={inFavorites ? "fill-[var(--fresh-green)] stroke-[var(--fresh-green)]" : undefined} />
          )}
          <span className="text-[10px] font-semibold leading-tight text-center px-0.5">
            {swipeAction === "addToCart"
              ? "В корзину"
              : inFavorites
                ? "В избранном"
                : "В избранное"}
          </span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            runDelete();
          }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-red-500 text-white active:bg-red-600 min-w-0"
        >
          <Trash2 size={20} />
          <span className="text-[10px] font-semibold leading-tight">Удалить</span>
        </button>
      </div>

      <div
        className="relative z-10 bg-white rounded-2xl border border-gray-100 touch-pan-y select-none will-change-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.22s ease-out",
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          dragging.current = true;
          setIsDragging(true);
          startX.current = e.clientX;
          startT.current = translateX;
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const dx = e.clientX - startX.current;
          let next = startT.current + dx;
          next = Math.max(-ACTIONS_W, Math.min(0, next));
          setTranslateX(next);
        }}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
      >
        {children}
      </div>
    </div>
  );
}
