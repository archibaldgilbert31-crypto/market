import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, readJson } from "../api";

type FinanceJson = {
  revenueRub: number;
  platformFeeEstimateRub: number;
  estimatedSellerProfitRub: number;
  ordersWithSellerLines: number;
  commissionRate: number;
  from: string;
  to: string;
  note?: string;
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
  if (preset === "day") {
    return { from: startOfDay(new Date()), to };
  }
  if (preset === "week") {
    const f = startOfDay(new Date());
    f.setDate(f.getDate() - 6);
    return { from: f, to };
  }
  const f = startOfDay(new Date());
  f.setMonth(f.getMonth() - 1);
  return { from: f, to };
}

export function FinancePage() {
  const [preset, setPreset] = useState<"day" | "week" | "month" | "custom">("week");
  const [fromStr, setFromStr] = useState(() => startOfDay(new Date()).toISOString().slice(0, 10));
  const [toStr, setToStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<FinanceJson | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const queryRange = useMemo(() => {
    if (preset !== "custom") {
      return rangePreset(preset);
    }
    const from = startOfDay(new Date(fromStr + "T12:00:00"));
    const to = endOfDay(new Date(toStr + "T12:00:00"));
    return { from, to };
  }, [preset, fromStr, toStr]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const from = queryRange.from.toISOString();
    const to = queryRange.to.toISOString();
    const res = await apiFetch(`/api/seller/finance/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    try {
      const j = await readJson<FinanceJson & { error?: string }>(res);
      if (!res.ok) {
        setErr(j.error ?? res.statusText);
        setData(null);
      } else {
        setData(j);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setData(null);
    }
    setLoading(false);
  }, [queryRange.from, queryRange.to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Финансы</h1>
        <p className="text-sm text-slate-600">Выручка и оценка прибыли по вашим строкам в заказах.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-white border border-slate-200 rounded-xl p-4">
        {(["day", "week", "month"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPreset(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              preset === p ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200"
            }`}
          >
            {p === "day" ? "День" : p === "week" ? "Неделя" : "Месяц"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreset("custom")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
            preset === "custom" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200"
          }`}
        >
          Период
        </button>
        {preset === "custom" ? (
          <>
            <input type="date" value={fromStr} onChange={(e) => setFromStr(e.target.value)} className="border rounded-lg px-2 py-1 text-sm" />
            <span className="text-slate-400">—</span>
            <input type="date" value={toStr} onChange={(e) => setToStr(e.target.value)} className="border rounded-lg px-2 py-1 text-sm" />
          </>
        ) : null}
      </div>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      {loading ? (
        <p className="text-slate-600">Обновление…</p>
      ) : data ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase">Выручка</p>
            <p className="text-2xl font-bold mt-1">{data.revenueRub} ₽</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase">Оценка комиссии площадки</p>
            <p className="text-2xl font-bold mt-1">{data.platformFeeEstimateRub} ₽</p>
            <p className="text-xs text-slate-500 mt-1">Ставка: {(data.commissionRate * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:col-span-2">
            <p className="text-xs text-slate-500 uppercase">Оценка суммы после комиссии</p>
            <p className="text-3xl font-bold mt-1 text-emerald-700">{data.estimatedSellerProfitRub} ₽</p>
            <p className="text-sm text-slate-600 mt-2">Заказов с вашими позициями за период: {data.ordersWithSellerLines}</p>
          </div>
          {data.note ? <p className="sm:col-span-2 text-xs text-slate-500">{data.note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
