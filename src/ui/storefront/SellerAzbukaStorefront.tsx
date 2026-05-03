import { useMemo, useState } from "react";
import type { Product } from "@/ui/state/types";
import { CategorySection } from "./CategorySection";
import { AzbukaCategoryCard } from "./AzbukaCategoryCard";
import { Search } from "lucide-react";
import { pickHeroImage, resolveStorefrontSections } from "./resolveStorefront";
import type { StorefrontCategoryMatch } from "./types";

type Props = {
  sellerId: string;
  sellerName: string;
  vitrineType: string;
  products: Product[];
  onOpenCategory: (title: string, categoryIds: string[], categoryMatch?: StorefrontCategoryMatch) => void;
};

export function SellerAzbukaStorefront({
  sellerId,
  sellerName,
  vitrineType,
  products,
  onOpenCategory,
}: Props) {
  const [query, setQuery] = useState("");
  const sections = useMemo(
    () => resolveStorefrontSections(sellerId, vitrineType),
    [sellerId, vitrineType],
  );

  const normalizedQuery = query.trim().toLowerCase();

  return (
    <div className="px-4 pb-28">
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 bg-[var(--fresh-bg)]/95 backdrop-blur-sm border-b border-gray-100/80">
        <label className="sr-only">Поиск в магазине {sellerName}</label>
        <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-3 border border-gray-200/60">
          <Search size={20} className="text-gray-400 shrink-0" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Найти в ${sellerName}`}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-500 outline-none min-w-0"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="pt-4 space-y-2">
        {sections.map((section) => {
          const visibleRows = section.rows
            .map((row) =>
              row.filter((card) => !normalizedQuery || card.title.toLowerCase().includes(normalizedQuery)),
            )
            .filter((row) => row.length > 0);
          if (visibleRows.length === 0) return null;
          return (
            <CategorySection key={section.title} title={section.title}>
              <div className="space-y-2">
                {visibleRows.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-3 gap-2">
                    {row.map((card, ci) => (
                      <AzbukaCategoryCard
                        key={`${card.title}-${ci}`}
                        title={card.title}
                        bgClass={card.bgClass}
                        discountBadge={card.discountBadge}
                        colSpan={card.colSpan}
                        imageSrc={card.image ?? pickHeroImage(products, card.categoryIds, card.categoryMatch ?? "any")}
                        onClick={() => onOpenCategory(card.title, card.categoryIds, card.categoryMatch)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </CategorySection>
          );
        })}
      </div>

      {sections.every((s) => {
        const rows = s.rows
          .map((row) => row.filter((c) => !normalizedQuery || c.title.toLowerCase().includes(normalizedQuery)))
          .filter((r) => r.length > 0);
        return rows.length === 0;
      }) ? (
        <p className="text-center text-gray-500 text-sm py-8">Ничего не найдено</p>
      ) : null}
    </div>
  );
}
