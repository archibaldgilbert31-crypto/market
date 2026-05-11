import type { CartItem } from "@/ui/state/types";
import type { Product } from "@/ui/state/types";

export const OUT_OF_STOCK_LABEL = "Нет в наличии";

function normalizeSku(s: string): string {
  return String(s).trim();
}

/** Число из Json (число или строка "50", "0") */
function coerceNonNegInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", ".").trim());
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return null;
}

/** Остатки по размерам: `attributes.sizeStock` */
export function parseSizeStock(product: Product): Record<string, number> | undefined {
  const raw =
    product.attributes && "sizeStock" in product.attributes
      ? (product.attributes as { sizeStock?: unknown }).sizeStock
      : undefined;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = normalizeSku(String(k));
    if (!key) continue;
    const q = coerceNonNegInt(v);
    if (q === null) continue;
    out[key] = q;
  }
  return Object.keys(out).length ? out : undefined;
}

/** Количество по SKU в матрице; при отсутствии ключа — 0 (матрица заведена). */
function matrixQtyForSku(map: Record<string, number>, sku: string): number {
  const s = normalizeSku(sku);
  if (Object.prototype.hasOwnProperty.call(map, s)) return map[s] ?? 0;
  for (const [k, v] of Object.entries(map)) {
    if (normalizeSku(k) === s) return v;
  }
  return 0;
}

function sizeDeclared(product: Product, variantId: string): boolean {
  const sizes = product.attributes?.size;
  if (!Array.isArray(sizes)) return false;
  const v = normalizeSku(variantId);
  return sizes.some((x) => normalizeSku(String(x)) === v);
}

export function productHasSizeOptions(product: Product): boolean {
  const s = product.attributes?.size;
  return Array.isArray(s) && s.length > 0;
}

export function productLevelAvailable(product: Product): boolean {
  if (!product.inStock) return false;
  const sq = product.stockQty;
  if (sq !== undefined && sq <= 0) return false;
  return true;
}

/** Доступна ли позиция (без размера или конкретный variantId размера). */
export function isVariantAvailable(product: Product, variantId?: string): boolean {
  if (!productHasSizeOptions(product)) {
    return productLevelAvailable(product);
  }
  const vid = variantId !== undefined && variantId !== null ? normalizeSku(String(variantId)) : "";
  if (!vid || !sizeDeclared(product, vid)) return false;

  const map = parseSizeStock(product);
  if (map && Object.keys(map).length > 0) {
    return matrixQtyForSku(map, vid) > 0;
  }
  return productLevelAvailable(product);
}

/** Первый размер с остатком; без матрицы — первый из списка, если товар в целом доступен. */
export function firstAvailableSize(product: Product): string | null {
  const sizes = product.attributes?.size;
  if (!Array.isArray(sizes) || sizes.length === 0) return null;

  const map = parseSizeStock(product);
  if (map && Object.keys(map).length > 0) {
    for (const raw of sizes) {
      const id = normalizeSku(String(raw));
      if (!id) continue;
      if (matrixQtyForSku(map, id) > 0) return id;
    }
    return null;
  }

  if (productLevelAvailable(product)) {
    const first = sizes[0];
    return first != null ? normalizeSku(String(first)) : null;
  }
  return null;
}

/** Размер в списке, но недоступен по остаткам */
export function isSizeOptionSoldOut(product: Product, size: string): boolean {
  if (!productHasSizeOptions(product)) return false;
  if (!sizeDeclared(product, size)) return false;
  return !isVariantAvailable(product, size);
}

/** Строка корзины/избранного: если товар есть в каталоге — учитываем остатки, иначе показываем цену. */
export function isCartLineUnavailable(item: CartItem, product: Product | undefined): boolean {
  if (!product) return false;
  return !isVariantAvailable(product, item.variantId);
}

/** В ленте каталога: можно ли купить хотя бы один вариант (размер или товар без размеров). */
export function hasAnyPurchasableVariant(product: Product): boolean {
  if (!productHasSizeOptions(product)) {
    return productLevelAvailable(product);
  }
  const sizes = product.attributes!.size as unknown[];
  for (const raw of sizes) {
    if (isVariantAvailable(product, String(raw))) return true;
  }
  return false;
}
