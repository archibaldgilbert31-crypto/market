import type { Product } from "@/ui/state/types";
import { useCatalogStore } from "@/ui/state/catalogStore";
import type { StorefrontCardDef, StorefrontCategoryMatch, StorefrontSectionDef } from "./types";
import { getStaticStorefront } from "./storefrontSections";

const FALLBACK_BG = ["bg-rose-50", "bg-amber-50", "bg-lime-50", "bg-sky-50", "bg-violet-50", "bg-orange-50"];

function bgForIndex(i: number): string {
  return FALLBACK_BG[i % FALLBACK_BG.length];
}

/** Карточки из filterConfig, если для продавца нет статической раскладки. */
export function buildFallbackStorefront(vitrineType: string): StorefrontSectionDef[] {
  const filterConfig = useCatalogStore.getState().filterConfig;
  const cfg = filterConfig[vitrineType];
  const cats = cfg?.categories ?? [];
  if (cats.length === 0) {
    return [
      {
        title: "Разделы",
        rows: [[{ title: "Все товары", bgClass: "bg-stone-100", categoryIds: [], colSpan: 3 }]],
      },
    ];
  }
  const rows: StorefrontCardDef[][] = [];
  let row: StorefrontCardDef[] = [];
  let span = 0;
  cats.forEach((c, i) => {
    const card: StorefrontCardDef = {
      title: c.label,
      bgClass: bgForIndex(i),
      categoryIds: [c.id],
      colSpan: 1,
    };
    if (span + card.colSpan > 3) {
      if (row.length) rows.push(row);
      row = [];
      span = 0;
    }
    row.push(card);
    span += card.colSpan;
    if (span === 3) {
      rows.push(row);
      row = [];
      span = 0;
    }
  });
  if (row.length) rows.push(row);
  return [{ title: "Категории", rows }];
}

export function resolveStorefrontSections(sellerId: string, vitrineType: string): StorefrontSectionDef[] {
  return getStaticStorefront(sellerId) ?? buildFallbackStorefront(vitrineType);
}

function productMatchesCategories(
  categoryIds: string[],
  match: StorefrontCategoryMatch,
  productCategoryIds: string[],
): boolean {
  if (categoryIds.length === 0) return true;
  if (match === "all") {
    return categoryIds.every((c) => productCategoryIds.includes(c));
  }
  return categoryIds.some((c) => productCategoryIds.includes(c));
}

export function pickHeroImage(
  sellerProducts: Product[],
  categoryIds: string[],
  categoryMatch: StorefrontCategoryMatch = "any",
): string | undefined {
  const matchFn = (p: Product) =>
    categoryIds.length === 0 || productMatchesCategories(categoryIds, categoryMatch, p.categoryIds);
  const p = sellerProducts.find(matchFn);
  return p?.images[0];
}

export function filterProductsByCard(
  sellerProducts: Product[],
  categoryIds: string[],
  categoryMatch: StorefrontCategoryMatch = "any",
): Product[] {
  if (categoryIds.length === 0) return sellerProducts;
  return sellerProducts.filter((p) => productMatchesCategories(categoryIds, categoryMatch, p.categoryIds));
}
