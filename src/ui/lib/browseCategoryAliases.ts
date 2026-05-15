/**
 * Виртуальные подкатегории в режиме обзора: один чип матчится,
 * если у товара есть любой из перечисленных реальных categoryIds.
 * Сейчас пусто — подкатегории совпадают с тегами товаров один к одному.
 */
export const BROWSE_CATEGORY_OR_ALIASES: Readonly<Record<string, readonly string[]>> = {};

function categoryMatchesAlias(productCategoryIds: readonly string[], filterId: string): boolean {
  const aliases = BROWSE_CATEGORY_OR_ALIASES[filterId];
  if (aliases) return aliases.some((a) => productCategoryIds.includes(a));
  return productCategoryIds.includes(filterId);
}

/** Фильтрация списка при выборе чипов подкатегорий на экране магазина. */
export function productMatchesBrowseCategories(
  productCategoryIds: readonly string[],
  filterCategoryIds: string[],
  match: "any" | "all",
): boolean {
  if (filterCategoryIds.length === 0) return true;
  if (match === "all") {
    return filterCategoryIds.every((c) => categoryMatchesAlias(productCategoryIds, c));
  }
  return filterCategoryIds.some((c) => categoryMatchesAlias(productCategoryIds, c));
}
