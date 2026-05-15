export type StorefrontCardSpan = 1 | 2 | 3;

export type StorefrontCategoryMatch = "any" | "all";

export type StorefrontCardDef = {
  title: string;
  bgClass: string;
  discountBadge?: string;
  categoryIds: string[];
  /** По умолчанию «любой»: достаточно совпадения по одному id. «все» — у товара должны быть все перечисленные теги. */
  categoryMatch?: StorefrontCategoryMatch;
  colSpan: StorefrontCardSpan;
  /** Статическая картинка карточки (приоритет над автоподбором из товаров) */
  image?: string;
  /** Без картинки и без плейсхолдера — только фон и текст */
  hideImage?: boolean;
};

export type StorefrontSectionDef = {
  title: string;
  rows: StorefrontCardDef[][];
};
