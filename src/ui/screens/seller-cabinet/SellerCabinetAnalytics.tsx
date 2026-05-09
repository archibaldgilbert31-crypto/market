import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { sellerCabinetFetch } from "@/ui/api/sellerCabinetFetch";
import { formatRub } from "./formatRub";

type TopRow = { productId: string; title: string; unitsSold: number; revenueRub: number };
type ViewRow = { productId: string; title: string; views: number };

function errorMessage(status: number, body: { error?: string }): string {
  if (status === 401) return "Сессия истекла. Войдите снова.";
  if (status === 403) return "Доступ только для продавцов.";
  if (body.error) return body.error;
  return "Не удалось загрузить данные";
}

export function SellerCabinetAnalytics() {
  const [top, setTop] = useState<TopRow[]>([]);
  const [views, setViews] = useState<ViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expandSales, setExpandSales] = useState(false);
  const [expandViews, setExpandViews] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [tRes, vRes] = await Promise.all([
        sellerCabinetFetch("/api/seller/analytics/top-products?limit=15"),
        sellerCabinetFetch("/api/seller/analytics/product-views?limit=15"),
      ]);
      const tJson = (await tRes.json().catch(() => ({}))) as { top?: TopRow[]; error?: string };
      const vJson = (await vRes.json().catch(() => ({}))) as { views?: ViewRow[]; error?: string };

      if (!tRes.ok) {
        setErr(errorMessage(tRes.status, tJson));
        setTop([]);
        setViews([]);
        return;
      }
      if (!vRes.ok) {
        setErr(errorMessage(vRes.status, vJson));
        setTop(tJson.top ?? []);
        setViews([]);
        return;
      }
      setTop(tJson.top ?? []);
      setViews(vJson.views ?? []);
    } catch {
      setErr("Проверьте соединение и попробуйте снова.");
      setTop([]);
      setViews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const salesSummary = useMemo(() => {
    const slice = top.slice(0, 5);
    const units = slice.reduce((s, r) => s + r.unitsSold, 0);
    const revenue = slice.reduce((s, r) => s + r.revenueRub, 0);
    return { units, revenue, count: slice.length };
  }, [top]);

  const viewsSummary = useMemo(() => {
    const slice = views.slice(0, 5);
    const total = slice.reduce((s, r) => s + r.views, 0);
    return { total, count: slice.length };
  }, [views]);

  const topVisible = expandSales ? top : top.slice(0, 5);
  const viewsVisible = expandViews ? views : views.slice(0, 5);

  return (
    <div className="px-4 pt-2 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600">Краткая сводка по вашему магазину</p>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          aria-label="Обновить"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {err ? (
        <div className="bg-red-50 border border-red-100 text-red-800 text-sm rounded-2xl px-4 py-3 space-y-2">
          <p>{err}</p>
          <button type="button" onClick={() => load()} className="font-semibold text-[var(--fresh-green-dark)] underline">
            Повторить
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">Загрузка аналитики…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Выручка (топ‑5 SKU)</p>
              <p className="text-2xl font-bold text-[var(--fresh-green)] tabular-nums">{formatRub(salesSummary.revenue)} ₽</p>
              <p className="text-[11px] text-gray-400 mt-1">{salesSummary.units} шт. продано</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Просмотры (топ‑5)</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatRub(viewsSummary.total)}</p>
              <p className="text-[11px] text-gray-400 mt-1">за выбранные позиции</p>
            </div>
          </div>

          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandSales((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
              <span className="font-semibold text-gray-900 text-sm">Топ продаж</span>
              {expandSales ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {top.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-gray-500">Пока нет данных по продажам.</p>
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-gray-100">
                {topVisible.map((row, i) => (
                  <li key={row.productId} className="px-4 py-3 flex gap-3 min-w-0">
                    <span className="text-xs text-gray-400 w-5 shrink-0 pt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{row.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{row.unitsSold} шт. · {formatRub(row.revenueRub)} ₽</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {top.length > 5 && !expandSales ? (
              <p className="px-4 py-2 text-xs text-gray-400 text-center bg-gray-50">Ещё {top.length - 5} поз. — разверните блок</p>
            ) : null}
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandViews((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
              <span className="font-semibold text-gray-900 text-sm">Просмотры карточек</span>
              {expandViews ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {views.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-gray-500">Пока нет просмотров.</p>
            ) : (
              <ul className="divide-y divide-gray-100 border-t border-gray-100">
                {viewsVisible.map((row, i) => (
                  <li key={row.productId} className="px-4 py-3 flex gap-3 min-w-0">
                    <span className="text-xs text-gray-400 w-5 shrink-0 pt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{row.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatRub(row.views)} просм.</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {views.length > 5 && !expandViews ? (
              <p className="px-4 py-2 text-xs text-gray-400 text-center bg-gray-50">Ещё {views.length - 5} поз. — разверните блок</p>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
