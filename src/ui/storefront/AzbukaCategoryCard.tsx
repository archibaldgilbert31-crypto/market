import type { StorefrontCardSpan } from "./types";

type Props = {
  title: string;
  bgClass: string;
  imageSrc?: string;
  /** Только текст на цветном фоне, без фото и без плейсхолдера */
  textOnly?: boolean;
  discountBadge?: string;
  colSpan: StorefrontCardSpan;
  onClick: () => void;
};

const SPAN_MAP: Record<StorefrontCardSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
};

export function AzbukaCategoryCard({
  title,
  bgClass,
  imageSrc,
  textOnly,
  discountBadge,
  colSpan,
  onClick,
}: Props) {
  const isWide = colSpan >= 2;
  const showPhoto = Boolean(imageSrc);
  const showPlaceholder = !textOnly && !showPhoto;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative ${SPAN_MAP[colSpan]} rounded-[20px] overflow-hidden text-left
        transition-all duration-200 active:scale-[0.97]
        ${textOnly ? "flex flex-col justify-center items-stretch" : ""}
        ${bgClass}
      `}
      style={{ minHeight: isWide ? 130 : 140 }}
    >
      {/* subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/[0.03] pointer-events-none" />

      {/* text content */}
      <div
        className={`relative z-10 ${textOnly ? "px-4 py-4 flex flex-col justify-center flex-1 w-full" : "p-3.5 pb-2"}`}
        style={{ maxWidth: textOnly ? undefined : showPhoto ? (isWide ? "65%" : "60%") : "100%" }}
      >
        <span className="text-[13px] leading-[1.25] font-bold text-gray-900 block">
          {title}
        </span>
        {discountBadge && (
          <span className="mt-2 inline-flex items-center rounded-lg bg-[var(--fresh-green)] text-white text-[11px] font-extrabold px-2.5 py-1 shadow-sm">
            до {discountBadge}
          </span>
        )}
      </div>

      {/* product image */}
      {showPhoto ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className={`
            pointer-events-none absolute bottom-0 right-0
            object-contain object-bottom drop-shadow-lg
            transition-transform duration-300 group-hover:scale-105
            ${isWide ? "w-[44%] max-h-[90%]" : "w-[56%] max-h-[80%]"}
          `}
        />
      ) : showPlaceholder ? (
        <div className="pointer-events-none absolute bottom-2 right-3 w-14 h-14 rounded-2xl bg-white/30" />
      ) : null}
    </button>
  );
}
