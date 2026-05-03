import { Star } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { Header } from "@/ui/shared/Header";
import { useMemo } from "react";
import { useCatalogStore } from "@/ui/state/catalogStore";
import type { Review } from "@/ui/state/types";

export function Reviews() {
  const { id } = useParams();
  const nav = useNavigate();
  const products = useCatalogStore((s) => s.products);
  const loaded = useCatalogStore((s) => s.loaded);
  const product = useMemo(() => products.find((p) => p.id === id), [id, products]);

  const reviews = useMemo(() => (product?.reviews as Review[] | undefined) ?? [], [product]);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingStats = useMemo(() => {
    const stats = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        stats[5 - r.rating]++;
      }
    });
    return stats;
  }, [reviews]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--fresh-bg)]">
        <Header title="Отзывы" onBack={() => nav(-1)} />
        <div className="p-10 text-center text-gray-500">Загрузка…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--fresh-bg)]">
        <Header title="Отзывы" onBack={() => nav(-1)} />
        <div className="p-10 text-center text-gray-500">Товар не найден</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--fresh-bg)]">
      <Header title="Отзывы" onBack={() => nav(-1)} />

      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-start gap-8 mb-6">
          <div className="text-center">
            <div className="text-5xl font-black text-gray-900 mb-1">{averageRating}</div>
            <div className="flex justify-center mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={s <= Math.round(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                />
              ))}
            </div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
              {reviews.length} отзывов
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {ratingStats.map((count, i) => {
              const stars = 5 - i;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-2">{stars}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-6 text-right font-medium">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
          Все отзывы
          <span className="text-xs font-medium text-gray-400">Сначала новые</span>
        </h2>

        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center text-[var(--fresh-green)] font-bold shadow-inner">
                      {r.userName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">{r.userName}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{r.date}</div>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        className={s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{r.text}"
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200">
              <div className="text-4xl mb-4 opacity-20">✍️</div>
              <p className="text-gray-400 text-sm">Пока нет отзывов. Станьте первым!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
