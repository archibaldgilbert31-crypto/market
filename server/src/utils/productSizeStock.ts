/** Нормализация attributes.size + attributes.sizeStock для товаров одежды (и опционально других витрин). */

export type SizeStockMap = Record<string, number>;

export function isClothingVitrine(vitrineType: string): boolean {
  return vitrineType === "clothes";
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Из тела запроса продавца: склеивает attributes, считает суммарный остаток. */
export function normalizeProductAttributes(
  vitrineType: string,
  attributesInput: unknown,
  fallbackStockQty: number,
): { attributes: Record<string, unknown> | null; stockQty: number; inStockImplicit: boolean } {
  if (!isPlainObject(attributesInput)) {
    return {
      attributes: null,
      stockQty: Math.max(0, Math.floor(fallbackStockQty)),
      inStockImplicit: fallbackStockQty > 0,
    };
  }

  const rawSize = attributesInput.size;
  const rawStock = attributesInput.sizeStock;

  const sizeList: string[] = Array.isArray(rawSize)
    ? rawSize.map((x) => String(x).trim()).filter(Boolean)
    : [];

  let sizeStock: SizeStockMap = {};
  if (isPlainObject(rawStock)) {
    for (const [k, v] of Object.entries(rawStock)) {
      const key = k.trim();
      if (!key) continue;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) continue;
      sizeStock[key] = Math.max(0, Math.floor(n));
    }
  }

  const useMatrix = isClothingVitrine(vitrineType) && sizeList.length > 0;

  if (!useMatrix) {
    const cleaned = { ...attributesInput };
    if (sizeList.length === 0) {
      delete cleaned.size;
      delete cleaned.sizeStock;
    }
    const keys = Object.keys(cleaned);
    if (keys.length === 0) {
      return {
        attributes: null,
        stockQty: Math.max(0, Math.floor(fallbackStockQty)),
        inStockImplicit: fallbackStockQty > 0,
      };
    }
    return {
      attributes: cleaned,
      stockQty: Math.max(0, Math.floor(fallbackStockQty)),
      inStockImplicit: fallbackStockQty > 0,
    };
  }

  for (const s of sizeList) {
    if (sizeStock[s] === undefined) sizeStock[s] = 0;
  }
  for (const k of Object.keys(sizeStock)) {
    if (!sizeList.includes(k)) delete sizeStock[k];
  }

  const stockQty = sizeList.reduce((acc, s) => acc + (sizeStock[s] ?? 0), 0);

  const nextAttributes: Record<string, unknown> = {
    ...attributesInput,
    size: sizeList,
    sizeStock,
  };

  return {
    attributes: nextAttributes,
    stockQty,
    inStockImplicit: stockQty > 0,
  };
}

export function sumSizeStock(attrs: unknown): number {
  if (!isPlainObject(attrs)) return 0;
  const m = attrs.sizeStock;
  if (!isPlainObject(m)) return 0;
  let t = 0;
  for (const v of Object.values(m)) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) t += Math.max(0, Math.floor(n));
  }
  return t;
}

export function parseAttributesJson(raw: unknown): Record<string, unknown> | null {
  if (!isPlainObject(raw)) return null;
  return raw;
}

function coerceStockVal(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.replace(",", ".").trim());
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return null;
}

function lookupRawStock(rawMap: Record<string, unknown>, sku: string): number | null {
  const key = sku.trim();
  if (Object.prototype.hasOwnProperty.call(rawMap, key)) {
    return coerceStockVal(rawMap[key]);
  }
  for (const [rk, rv] of Object.entries(rawMap)) {
    if (String(rk).trim() === key) return coerceStockVal(rv);
  }
  return null;
}

/** Списание по заказу: обновляет sizeStock и возвращает новые поля продукта. */
export function decrementProductStock(
  product: {
    stockQty: number;
    inStock: boolean;
    attributes: unknown;
  },
  quantity: number,
  variantId: string | null | undefined,
): { stockQty: number; inStock: boolean; attributes: unknown } {
  const q = Math.max(0, Math.floor(quantity));
  if (q <= 0) {
    return { stockQty: product.stockQty, inStock: product.inStock, attributes: product.attributes };
  }

  const attrs = parseAttributesJson(product.attributes);
  const sizesRaw = attrs && Array.isArray(attrs.size) ? (attrs.size as unknown[]) : [];
  const sizes = sizesRaw.map((x) => String(x).trim()).filter(Boolean);
  const rawMap = attrs && isPlainObject(attrs.sizeStock) ? (attrs.sizeStock as Record<string, unknown>) : null;

  const variant = variantId != null ? String(variantId).trim() : "";
  const inSizeList = variant ? sizes.some((s) => s === variant) : false;

  if (variant && sizes.length > 0 && rawMap && inSizeList && Object.keys(rawMap).length > 0) {
    const sizeStock: SizeStockMap = {};
    for (const s of sizes) {
      const v = lookupRawStock(rawMap, s);
      sizeStock[s] = v ?? 0;
    }
    const prevQty = sizeStock[variant] ?? 0;
    sizeStock[variant] = Math.max(0, prevQty - q);
    const nextAttrs = attrs ? { ...attrs, sizeStock } : { sizeStock };
    const stockQty = sizes.reduce((acc, s) => acc + (sizeStock[s] ?? 0), 0);
    return { stockQty, inStock: stockQty > 0, attributes: nextAttrs };
  }

  const stockQty = Math.max(0, product.stockQty - q);
  return { stockQty, inStock: stockQty > 0, attributes: product.attributes };
}
