import { useEffect, useState } from "react";
import { apiFetch, readJson } from "../api";

type TopRow = { productId: string; title: string; unitsSold: number; revenueRub: number };

type ViewRow = { productId: string; title: string; views: number };

export function AnalyticsPage() {
  const [top, setTop] = useState<TopRow[]>([]);
  const [views, setViews] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [tRes, vRes] = await Promise.all([
        apiFetch("/api/seller/analytics/top-products?limit=15"),
        apiFetch("/api/seller/analytics/product-views?limit=20"),
      ]);
      try {
        const tJson = await readJson<{ top?: TopRow[] }>(tRes);
        const vJson = await readJson<{ views?: ViewRow[] }>(vRes);
        if (!cancelled) {
          setTop(tJson.top ?? []);
          setViews(vJson.views ?? []);
        }
      } catch {
        if (!cancelled) {
          setTop([]);
          setViews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Анализ</h1>
        <p className="text-sm text-slate-600">Только ваш магазин.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Топ продаж</h2>
        <p className="text-xs text-slate-500 mb-4">По количеству проданных единиц (сохранённые заказы с бэкенда).</p>
        {loading ? (
          <p className="text-slate-500">Загрузка…</p>
        ) : top.length === 0 ? (
          <p className="text-slate-500 text-sm">Пока нет данных — оформите тестовый заказ через приложение.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="pb-2">Товар</th>
                  <th className="pb-2">Продано, шт.</th>
                  <th className="pb-2">Выручка, ₽</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top.map((r) => (
                  <tr key={r.productId}>
                    <td className="py-2 font-medium">{r.title}</td>
                    <td className="py-2">{r.unitsSold}</td>
                    <td className="py-2">{r.revenueRub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Просмотры карточек</h2>
        <p className="text-xs text-slate-500 mb-4">Запись при открытии товара в основном приложении.</p>
        {loading ? (
          <p className="text-slate-500">Загрузка…</p>
        ) : views.length === 0 ? (
          <p className="text-slate-500 text-sm">Пока нет просмотров.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="pb-2">Товар</th>
                  <th className="pb-2">Просмотров</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {views.map((r) => (
                  <tr key={r.productId}>
                    <td className="py-2 font-medium">{r.title}</td>
                    <td className="py-2">{r.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
