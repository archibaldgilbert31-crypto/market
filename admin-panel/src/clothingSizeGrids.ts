/** Пресеты размерных сеток для витрины «Одежда» (админка продавца). */

export type SizeGridKind =
  | "tops"
  | "outer"
  | "bottoms"
  | "shoes"
  | "hats"
  | "gloves"
  | "one_size"
  | "custom";

export type SizeGridPresetMeta = {
  id: SizeGridKind;
  /** Показываем в конструкторе (кроме custom) */
  selectable: boolean;
  title: string;
  shortHint: string;
  /** Подпись единицы в подсказке */
  defaultUnitHint?: string;
  sizes: string[];
};

export const SIZE_GRID_PRESETS: SizeGridPresetMeta[] = [
  {
    id: "tops",
    selectable: true,
    title: "Верх: футболки, рубашки, свитеры",
    shortHint: "Буквенные размеры (EU/US ориентир).",
    defaultUnitHint: "например шт. или рост 170",
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "outer",
    selectable: true,
    title: "Куртки, пальто, пуховики",
    shortHint: "Частая линейка 44–58 (можно изменить строки ниже).",
    defaultUnitHint: "рост модели или EU",
    sizes: ["44", "46", "48", "50", "52", "54", "56", "58"],
  },
  {
    id: "bottoms",
    selectable: true,
    title: "Брюки, джинсы, юбки",
    shortHint: "Размер по талии (EU) или свой.",
    sizes: ["36", "38", "40", "42", "44", "46", "48"],
  },
  {
    id: "shoes",
    selectable: true,
    title: "Обувь",
    shortHint: "Размер обуви RU/EU по стельке.",
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  },
  {
    id: "hats",
    selectable: true,
    title: "Шапки, кепки",
    shortHint: "Обхват головы в см.",
    sizes: ["54", "55", "56", "57", "58", "59", "60"],
  },
  {
    id: "gloves",
    selectable: true,
    title: "Перчатки, варежки",
    shortHint: "Размер по обхвату ладони (дюймы как у производителей).",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
  },
  {
    id: "one_size",
    selectable: true,
    title: "Универсальный размер",
    shortHint: "Одна строка — без размерной сетки.",
    sizes: ["Универсальный"],
  },
  {
    id: "custom",
    selectable: false,
    title: "Своя сетка",
    shortHint: "Добавьте строки вручную.",
    sizes: [],
  },
];

const PRESET_MAP = Object.fromEntries(SIZE_GRID_PRESETS.map((p) => [p.id, p])) as Record<
  SizeGridKind,
  SizeGridPresetMeta
>;

export function getPreset(kind: SizeGridKind): SizeGridPresetMeta | undefined {
  return PRESET_MAP[kind];
}

export function presetToRows(kind: Exclude<SizeGridKind, "custom">): { label: string; qty: string }[] {
  const p = PRESET_MAP[kind];
  if (!p || !p.sizes.length) return [{ label: "", qty: "0" }];
  return p.sizes.map((label) => ({ label, qty: "0" }));
}

/** Сопоставление id категорий из фильтра/карточки → пресет (эвристика). */
const ALL_KIND_IDS = new Set(SIZE_GRID_PRESETS.map((p) => p.id));

/** Выбрать пресет для формы: приоритет сохранённого kind, затем категории, затем «верх». */
export function initialFormSizeGridKind(
  attrs: { sizeGridKind?: string } | undefined,
  categoryIds: string[],
  rowLabels: string[],
): SizeGridKind {
  const ordered: SizeGridKind[] = [];
  const raw = attrs?.sizeGridKind;
  if (typeof raw === "string" && ALL_KIND_IDS.has(raw as SizeGridKind)) {
    ordered.push(raw as SizeGridKind);
  }
  ordered.push(inferSizeGridKind(categoryIds));
  ordered.push("tops");
  const seen = new Set<SizeGridKind>();
  for (const k of ordered) {
    if (seen.has(k)) continue;
    seen.add(k);
    if (k === "custom") continue;
    if (rowLabelsFitPresetSubset(k, rowLabels)) return k;
  }
  const fitting = (Object.keys(PRESET_MAP) as SizeGridKind[]).filter(
    (kind) => kind !== "custom" && rowLabelsFitPresetSubset(kind, rowLabels),
  );
  if (fitting.length === 1) return fitting[0]!;
  return "custom";
}

/** Подставить строки пресета, сохранив остатки по совпадающим подписям размеров. */
export function mergePresetWithExistingQty(
  kind: Exclude<SizeGridKind, "custom">,
  prevRows: { label: string; qty: string }[],
): { label: string; qty: string }[] {
  const fresh = presetToRows(kind);
  const qtyBy = new Map(prevRows.map((r) => [String(r.label).trim(), r.qty]));
  return fresh.map((r) => ({
    label: r.label,
    qty: qtyBy.get(r.label) ?? r.qty,
  }));
}

/** Неполная сетка на складе: каждый размер должен входить в пресет. */
export function rowLabelsFitPresetSubset(kind: SizeGridKind, rowLabels: string[]): boolean {
  if (kind === "custom") return false;
  const preset = getPreset(kind);
  if (!preset?.sizes.length) return false;
  const labels = rowLabels.map((x) => String(x).trim()).filter(Boolean);
  const allowed = new Set(preset.sizes);
  return labels.length > 0 && labels.every((l) => allowed.has(l));
}

/** Совпадает ли набор подписей размеров с пресетом полностью (порядок не важен). */
export function rowLabelsMatchPreset(kind: SizeGridKind, rowLabels: string[]): boolean {
  if (kind === "custom") return false;
  const preset = getPreset(kind);
  if (!preset?.sizes.length) return false;
  const labels = rowLabels.map((x) => String(x).trim()).filter(Boolean);
  if (labels.length !== preset.sizes.length) return false;
  const a = [...labels].sort();
  const b = [...preset.sizes].sort();
  return a.every((x, i) => x === b[i]);
}

export function inferSizeGridKind(categoryIds: string[]): Exclude<SizeGridKind, "custom"> {
  const ids = new Set(categoryIds.map((x) => x.toLowerCase()));

  const has = (...keys: string[]) => keys.some((k) => ids.has(k.toLowerCase()));

  if (
    has(
      "shoes",
      "shoes_sneakers",
      "shoes_sale",
      "boots",
      "sneakers",
      "обувь",
    )
  ) {
    return "shoes";
  }
  if (has("hat_knit", "hat_cap", "headwear", "caps", "beanies")) {
    return "hats";
  }
  if (has("acc_gloves", "gloves", "mittens")) {
    return "gloves";
  }
  if (has("pants", "jeans", "bottoms", "skirts", "shorts")) {
    return "bottoms";
  }
  if (
    has(
      "outerwear",
      "jackets",
      "coats",
      "parkas",
      "outer",
      "puffer",
    )
  ) {
    return "outer";
  }
  if (
    has(
      "tshirts",
      "top_tshirt",
      "shirts",
      "knitwear",
      "dresses",
      "hoodies",
      "polo",
      "tops",
      "sportswear",
    )
  ) {
    return "tops";
  }
  return "tops";
}
