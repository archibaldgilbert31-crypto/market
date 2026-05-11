export type SellerCustomCategory = { id: string; label: string };

export type MergedSellerCategory = { id: string; label: string; editable: boolean };

export function excludingHiddenIds<T extends { id: string }>(items: T[], hidden: Iterable<string>): T[] {
  const h = new Set(hidden);
  return items.filter((x) => !h.has(x.id));
}


export function parseSellerCustomCategories(json: unknown): SellerCustomCategory[] {
  if (!Array.isArray(json)) return [];
  const out: SellerCustomCategory[] = [];
  const seen = new Set<string>();
  for (const raw of json) {
    if (typeof raw !== "object" || raw === null) continue;
    const id = typeof (raw as { id?: unknown }).id === "string" ? (raw as { id: string }).id.trim() : "";
    const label = typeof (raw as { label?: unknown }).label === "string" ? (raw as { label: string }).label.trim() : "";
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label });
  }
  return out;
}

function categoriesFromFilterConfig(fc: Record<string, unknown>): Map<string, string> {
  const seen = new Map<string, string>();
  const blocks = fc as Record<string, { categories?: Array<{ id: string; label: string }> }>;
  for (const block of Object.values(blocks ?? {})) {
    if (block?.categories) {
      for (const c of block.categories) {
        if (c.id && c.label) seen.set(String(c.id), String(c.label));
      }
    }
  }
  return seen;
}

export function mergeSellerMetaCategories(
  filterConfigJson: Record<string, unknown>,
  customs: SellerCustomCategory[],
): MergedSellerCategory[] {
  const globalMap = categoriesFromFilterConfig(filterConfigJson);
  const customIds = new Set(customs.map((c) => c.id));
  const merged = new Map(globalMap);
  for (const c of customs) {
    merged.set(c.id, c.label);
  }
  return [...merged.entries()]
    .map(([id, label]) => ({
      id,
      label,
      editable: customIds.has(id),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));
}
