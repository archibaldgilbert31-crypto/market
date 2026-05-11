import type { Product } from "@/ui/state/types";

export type SizeGridKind =
  | "tops"
  | "outer"
  | "bottoms"
  | "shoes"
  | "hats"
  | "gloves"
  | "one_size"
  | "custom";

const VALID: Set<string> = new Set([
  "tops",
  "outer",
  "bottoms",
  "shoes",
  "hats",
  "gloves",
  "one_size",
  "custom",
]);

/** Дубль размерных линеек admin-panel/src/clothingSizeGrids.ts — при изменении пресетов синхронизируйте. */
const PRESET_SIZES: Record<Exclude<SizeGridKind, "custom">, string[]> = {
  tops: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
  outer: ["44", "46", "48", "50", "52", "54", "56", "58"],
  bottoms: ["36", "38", "40", "42", "44", "46", "48"],
  shoes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  hats: ["54", "55", "56", "57", "58", "59", "60"],
  gloves: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
  one_size: ["Универсальный"],
};

/** Неполная сетка в продаже: достаточно, чтобы каждый размер был из пресета (не нужен полный ряд). */
function rowLabelsFitPresetSubset(kind: SizeGridKind, rowLabels: string[]): boolean {
  if (kind === "custom") return false;
  const preset = PRESET_SIZES[kind];
  const labels = rowLabels.map((x) => String(x).trim()).filter(Boolean);
  if (!preset?.length || labels.length === 0) return false;
  const allowed = new Set(preset);
  return labels.every((l) => allowed.has(l));
}

/** Дубль логики admin-panel/clothingSizeGrids.inferSizeGridKind — держите в соответствии. */
export function inferSizeGridKindFromCategories(categoryIds: string[]): SizeGridKind {
  const ids = new Set(categoryIds.map((x) => x.toLowerCase()));
  const has = (...keys: string[]) => keys.some((k) => ids.has(k.toLowerCase()));

  if (has("shoes", "shoes_sneakers", "shoes_sale", "boots", "sneakers")) return "shoes";
  if (has("hat_knit", "hat_cap", "headwear", "caps", "beanies")) return "hats";
  if (has("acc_gloves", "gloves", "mittens")) return "gloves";
  if (has("pants", "jeans", "bottoms", "skirts", "shorts")) return "bottoms";
  if (has("outerwear", "jackets", "coats", "parkas", "outer", "puffer")) return "outer";
  if (has("tshirts", "top_tshirt", "shirts", "knitwear", "dresses", "hoodies", "polo", "tops", "sportswear")) return "tops";
  return "tops";
}

function sizeLabelsFromProduct(product: Product): string[] {
  const attrs = product.attributes;
  const size = attrs && typeof attrs === "object" && !Array.isArray(attrs) && Array.isArray((attrs as { size?: unknown }).size)
    ? (attrs as { size: string[] }).size
    : [];
  return size.map((x) => String(x));
}

export function resolveSizeGridKind(product: Product): SizeGridKind {
  const attrs = product.attributes && typeof product.attributes === "object" && !Array.isArray(product.attributes)
    ? (product.attributes as Record<string, unknown>)
    : undefined;
  const raw = attrs?.sizeGridKind;
  const fromAttr = typeof raw === "string" && VALID.has(raw) ? (raw as SizeGridKind) : null;
  const labels = sizeLabelsFromProduct(product);
  const ordered: SizeGridKind[] = [];
  if (fromAttr) ordered.push(fromAttr);
  ordered.push(inferSizeGridKindFromCategories(product.categoryIds ?? []));
  ordered.push("tops");
  const seen = new Set<SizeGridKind>();
  for (const k of ordered) {
    if (seen.has(k)) continue;
    seen.add(k);
    if (k === "custom") continue;
    if (rowLabelsFitPresetSubset(k, labels)) return k;
  }

  const fitting = (Object.keys(PRESET_SIZES) as Exclude<SizeGridKind, "custom">[]).filter((kind) =>
    rowLabelsFitPresetSubset(kind, labels),
  );
  if (fitting.length === 1) return fitting[0]!;
  return "custom";
}

export type SizeChartRow = { a: string; b: string; c?: string };

export function sizeChartRowsForKind(kind: SizeGridKind): { title: string; rows: SizeChartRow[] } {
  switch (kind) {
    case "shoes":
      return {
        title: "Подбор по длине стопы",
        rows: [
          { a: "35", b: "~22–22,5 см" },
          { a: "36", b: "~23 см" },
          { a: "37", b: "~23,5 см" },
          { a: "38", b: "~24 см" },
          { a: "39", b: "~24,5 см" },
          { a: "40", b: "~25 см" },
          { a: "41", b: "~25,5 см" },
          { a: "42", b: "~26 см" },
          { a: "43", b: "~26,5–27 см" },
          { a: "44", b: "~27–27,5 см" },
          { a: "45", b: "~28 см" },
        ],
      };
    case "hats":
      return {
        title: "Обхват головы",
        rows: [
          { a: "54", b: "~54 см" },
          { a: "55", b: "~55 см" },
          { a: "56", b: "~56 см" },
          { a: "57", b: "~57 см" },
          { a: "58", b: "~58 см" },
          { a: "59", b: "~59 см" },
          { a: "60", b: "~60 см" },
        ],
      };
    case "gloves":
      return {
        title: "Размер × обхват ладони",
        rows: [
          { a: "6", b: "~16 см" },
          { a: "6.5", b: "~17 см" },
          { a: "7", b: "~18 см" },
          { a: "7.5", b: "~19 см" },
          { a: "8", b: "~20 см" },
          { a: "8.5", b: "~21 см" },
          { a: "9", b: "~22 см" },
          { a: "9.5", b: "~23 см" },
          { a: "10", b: "~24 см" },
        ],
      };
    case "bottoms":
      return {
        title: "Ориентир по EU / талия",
        rows: [
          { a: "36", b: "XS", c: "~64 см" },
          { a: "38", b: "S", c: "~68 см" },
          { a: "40", b: "M", c: "~72 см" },
          { a: "42", b: "L", c: "~76 см" },
          { a: "44", b: "XL", c: "~80 см" },
          { a: "46", b: "XXL", c: "~84 см" },
          { a: "48", b: "XXXL", c: "~88 см" },
        ],
      };
    case "outer":
      return {
        title: "Верхняя одежда (RU / объём)",
        rows: [
          { a: "44", b: "XS", c: "~88 см грудь" },
          { a: "46", b: "S", c: "~92 см" },
          { a: "48", b: "M", c: "~96 см" },
          { a: "50", b: "L", c: "~100 см" },
          { a: "52", b: "XL", c: "~104 см" },
          { a: "54", b: "XXL", c: "~108 см" },
          { a: "56", b: "", c: "~112 см" },
          { a: "58", b: "", c: "~116 см" },
        ],
      };
    case "one_size":
      return {
        title: "Универсальный размер",
        rows: [{ a: "—", b: "Один актуальный размер без линейки", c: undefined }],
      };
    case "tops":
    case "custom":
    default:
      return {
        title: "Футболки, свитеры (обхват груди)",
        rows: [
          { a: "S", b: "88–92 см", c: "164–170" },
          { a: "M", b: "96–100 см", c: "170–176" },
          { a: "L", b: "104–108 см", c: "176–182" },
          { a: "XL", b: "112–116 см", c: "182–188" },
          { a: "XXL", b: "120–124 см", c: "188–194" },
        ],
      };
  }
}

/** Заголовки столбцов модалки справки по размерам. */
export function sizeChartTableLabels(kind: SizeGridKind): { h1: string; h2: string; h3?: string } {
  switch (kind) {
    case "shoes":
      return { h1: "Размер", h2: "Стопа (ориентир)" };
    case "hats":
      return { h1: "Размер", h2: "Обхват" };
    case "gloves":
      return { h1: "Размер", h2: "Ладонь (ориентир)" };
    case "bottoms":
      return { h1: "EU", h2: "Линия", h3: "Талия (ориентир)" };
    case "outer":
      return { h1: "RU", h2: "EU", h3: "Объём" };
    case "one_size":
      return { h1: "", h2: "" };
    case "tops":
    case "custom":
    default:
      return { h1: "Размер", h2: "Обхват груди", h3: "Рост (см)" };
  }
}

export function sizeChartUsesThirdColumn(kind: SizeGridKind): boolean {
  return kind === "tops" || kind === "custom" || kind === "bottoms" || kind === "outer";
}
