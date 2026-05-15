import type { CatalogFilterConfigMap } from "@/ui/state/catalogStore";
import type { CategoryFilter } from "@/ui/state/types";

/** Совпадают ли два набора id категорий (без учёта порядка). */
export function categoryIdsMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join("\0");
  const sb = [...b].sort().join("\0");
  return sa === sb;
}

/** Подкатегории для строки чипов: берётся первый id из `rootCategoryIds`, для которого в конфиге заданы подкатегории (порядок id на карточке важен). */
export function findCategoryWithSubfilters(
  vitrineType: string,
  rootCategoryIds: string[],
  filterConfig: CatalogFilterConfigMap,
): CategoryFilter | null {
  const cfg = filterConfig[vitrineType];
  const cats = cfg?.categories ?? [];
  if (cats.length === 0 || rootCategoryIds.length === 0) return null;

  const catById = new Map<string, CategoryFilter>();
  for (const c of cats) catById.set(c.id, c as CategoryFilter);
  /** Первый корень из карточки, у которого в конфиге заданы подкатегории — совпадает с порядком намерения карточки */
  for (const rootId of rootCategoryIds) {
    const c = catById.get(rootId);
    if (c?.subcategories?.length) return c;
  }
  return null;
}
