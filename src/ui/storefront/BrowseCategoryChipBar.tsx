import { useMemo } from "react";
import type { CatalogFilterConfigMap } from "@/ui/state/catalogStore";
import { categoryIdsMatch, findCategoryWithSubfilters } from "@/ui/lib/subcategoryFilters";

export type BrowseChipBarProps = {
  vitrineType: string;
  filterConfig: CatalogFilterConfigMap;
  /** Заголовок при открытии раздела с карточки витрины */
  sectionTitle: string;
  /** Корневая фильтрация (набор id с карточки категории) */
  rootCategoryIds: string[];
  /** Текущий активный фильтр по категориям */
  activeCategoryIds: string[];
  onSelectFilter: (nextIds: string[]) => void;
};

export function BrowseCategoryChipBar({
  vitrineType,
  filterConfig,
  sectionTitle,
  rootCategoryIds,
  activeCategoryIds,
  onSelectFilter,
}: BrowseChipBarProps) {
  const meta = useMemo(
    () => findCategoryWithSubfilters(vitrineType, rootCategoryIds, filterConfig),
    [vitrineType, rootCategoryIds, filterConfig],
  );

  const subs = meta?.subcategories ?? [];
  const chipsCount = subs.length;

  const isAllSelected = categoryIdsMatch(activeCategoryIds, rootCategoryIds);

  const activeSubLabel = useMemo(() => {
    if (isAllSelected || subs.length === 0) return sectionTitle;
    if (activeCategoryIds.length === 1) {
      const hit = subs.find((s) => s.id === activeCategoryIds[0]);
      return hit?.label ?? sectionTitle;
    }
    return sectionTitle;
  }, [activeCategoryIds, isAllSelected, sectionTitle, subs]);

  if (chipsCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectFilter([...rootCategoryIds])}
          className={`shrink-0 px-3 py-2 rounded-full text-[13px] font-semibold transition-colors border border-transparent ${
            isAllSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          Все
        </button>
        {subs.map((s) => {
          const active = activeCategoryIds.length === 1 && activeCategoryIds[0] === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectFilter([s.id])}
              className={`shrink-0 px-3 py-2 rounded-full text-[13px] font-semibold transition-colors border border-transparent max-w-[220px] text-left leading-snug ${
                active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <button type="button" className="flex items-center gap-1 text-[15px] font-bold text-gray-900 tracking-tight">
        <span>{activeSubLabel}</span>
        <span className="text-gray-400 font-normal">›</span>
      </button>
    </div>
  );
}
