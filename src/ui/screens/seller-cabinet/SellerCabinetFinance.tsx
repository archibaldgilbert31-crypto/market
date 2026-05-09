import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { sellerCabinetFetch } from "@/ui/api/sellerCabinetFetch";
import { formatPercent, formatRub } from "./formatRub";

type FinanceJson = {
  revenueRub: number;
  platformFeeEstimateRub: number;
  estimatedSellerProfitRub: number;
  ordersWithSellerLines: number;
  commissionRate: number;
  from: string;
  to: string;
  note?: string;
  error?: string;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function rangePreset(preset: "day" | "week" | "month"): { from: Date; to: Date } {
  const to = endOfDay(new Date());
  if (preset === "day") return { from: startOfDay(new Date()), to };
  if (preset === "week") {
    const f = startOfDay(new Date());
    f.setDate(f.getDate() - 6);
    return { from: f, to };
  }
  const f = startOfDay(new Date());
  f.setMonth(f.getMonth() - 1);
  return { from: f, to };
}

function financeError(status: number, body: FinanceJson): string {
  if (status === 401) return "Сессия истекла. Войдите снова.";
  if (status === 403) return "Доступ только для продавцов.";
  if (body.error) return body.error;
  return "Не удалось загрузить сводку";
}

const presetBtn = (active: boolean) =>
  `flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
    active ? "bg-[var(--fresh-green)] text-white" : "bg-white text-gray-700 border border-gray-100 hover:bg-gray-50"
  }`;

export function SellerCabinetFinance() {
  const [preset, setPreset] = useState<"day" | "week" | "month" | "custom">("week");
  const [fromStr, setFromStr] = useState(() => startOfDay(new Date()).toISOString().slice(0, 10));
  const [toStr, setToStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<FinanceJson | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const queryRange = useMemo(() => {
    if (preset !== "custom") return rangePreset(preset);
    const from = startOfDay(new Date(fromStr + "T12:00:00"));
    const to = endOfDay(new Date(toStr + "T12:00:00"));
    return { from, to };
  }, [preset, fromStr, toStr]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const from = queryRange.from.toISOString();
    const to = queryRange.to.toISOString();
    const q = `/api/seller/finance/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    try {
      const res = await sellerCabinetFetch(q);
      const j = (await res.json()) as FinanceJson;
      if (!res.ok) {
        setErr(financeError(res.status, j));
        setData(null);
      } else {
        setData(j);
      }
    } catch {
      setErr("Проверьте соединение и попробуйте снова.");
      setData(null);
    }
    setLoading(false);
  }, [queryRange.from, queryRange.to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="px-4 pt-2 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-600 leading-snug">Выручка и оценка по вашим строкам заказов за период</p>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shrink-0 disabled:opacity-50"
          aria-label="Обновить"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={presetBtn(preset === "day")} onClick={() => setPreset("day")}>
          День
        </button>
        <button type="button" className={presetBtn(preset === "week")} onClick={() => setPreset("week")}>
          7 дней
        </button>
        <button type="button" className={presetBtn(preset === "month")} onClick={() => setPreset("month")}>
          Месяц
        </button>
        <button type="button" className={presetBtn(preset === "custom")} onClick={() => setPreset("custom")}>
          Свой
        </button>
      </div>

      {preset === "custom" ? (
        <div className="grid grid-cols-2 gap-3 bg-white rounded-2xl border border-gray-100 p-4">
          <label className="block text-xs">
            <span className="text-gray-500">С</span>
            <input
              type="date"
              value={fromStr}
              onChange={(e) => setFromStr(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="text-gray-500">По</span>
            <input
              type="date"
              value={toStr}
              onChange={(e) => setToStr(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-2 text-sm"
            />
          </label>
        </div>
      ) : null}

      {err ? (
        <div className="bg-red-50 border border-red-100 text-red-800 text-sm rounded-2xl px-4 py-3 space-y-2">
          <p>{err}</p>
          <button type="button" onClick={() => load()} className="font-semibold text-[var(--fresh-green-dark)] underline">
            Повторить
          </button>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="py-16 text-center text-sm text-gray-500">Считаем финансы…</div>
      ) : data ? (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-1">
            <p className="text-xs text-gray-500">Период</p>
            <p className="text-sm font-medium text-gray-800">
              {new Date(data.from).toLocaleDateString("ru-RU")} — {new Date(data.to).toLocaleDateString("ru-RU")}
            </p>
            <p className="text-xs text-gray-400 pt-1">Комиссия площадки: {formatPercent(data.commissionRate)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Выручка</p>
              <p className="text-3xl font-bold text-[var(--fresh-green)] tabular-nums">{formatRub(data.revenueRub)} ₽</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Комиссия (оценка)</p>
                <p className="text-lg font-semibold text-gray-900 tabular-nums">{formatRub(data.platformFeeEstimateRub)} ₽</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Вам (~)</p>
                <p className="text-lg font-semibold text-[var(--fresh-green-dark)] tabular-nums">{formatRub(data.estimatedSellerProfitRub)} ₽</p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">Заказов с вашими позициями</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{data.ordersWithSellerLines}</p>
            </div>
          </div>

          {data.note ? <p className="text-[11px] text-gray-400 leading-relaxed px-1">{data.note}</p> : null}
        </>
      ) : null}
    </div>
  );
}
