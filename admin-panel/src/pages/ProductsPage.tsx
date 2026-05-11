import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiFetch, readJson, uploadSellerProductImages } from "../api";
import {
  SIZE_GRID_PRESETS,
  presetToRows,
  mergePresetWithExistingQty,
  rowLabelsFitPresetSubset,
  initialFormSizeGridKind,
  inferSizeGridKind,
  type SizeGridKind,
} from "../clothingSizeGrids";

type ProductRow = {
  id: string;
  title: string;
  vitrineType: string;
  categoryIds: string[];
  price: number;
  unitLabel: string;
  stockQty: number;
  inStock: boolean;
  images: string[];
  description?: string;
  attributes?: { size?: string[]; sizeStock?: Record<string, number>; sizeGridKind?: string };
};

type CategoryOpt = { id: string; label: string; editable?: boolean };

type SizeRow = { label: string; qty: string };

const defaultNewClothingGrid = () => ({
  sizeGridKind: "tops" as SizeGridKind,
  sizeRows: presetToRows("tops"),
});

function stockSummary(p: ProductRow): string {
  if (p.vitrineType !== "clothes" || !p.attributes?.size?.length) return String(p.stockQty);
  const { size, sizeStock } = p.attributes;
  return size!.map((s) => `${s}:${sizeStock?.[s] ?? 0}`).join(" · ");
}

const VITRINE_TYPES = [
  "groceries",
  "ready_food",
  "sushi",
  "burgers",
  "pizza",
  "georgian",
  "clothes",
  "tools",
  "components",
  "electronics",
] as const;

const emptyForm = () => {
  const g = defaultNewClothingGrid();
  return {
    title: "",
    vitrineType: "clothes" as string,
    categoryIds: [] as string[],
    price: "",
    unitLabel: "шт.",
    stockQty: "10",
    description: "",
    imageUrls: [] as string[],
    inStock: true,
    sizeGridKind: g.sizeGridKind,
    sizeRows: g.sizeRows,
  };
};

export function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>("__new__");

  type FormShape = ReturnType<typeof emptyForm>;
  const [f, setF] = useState<FormShape>(() => emptyForm());

  const clothesStockPreview = useMemo(
    () =>
      f.sizeRows.reduce((acc, r) => {
        if (!String(r.label).trim()) return acc;
        const q = Number(String(r.qty).replace(",", "."));
        if (!Number.isFinite(q) || q < 0) return acc;
        return acc + Math.floor(q);
      }, 0),
    [f.sizeRows],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [pr, cats] = await Promise.all([
        apiFetch("/api/seller/products"),
        apiFetch("/api/seller/meta/categories"),
      ]);
      const pj = await readJson<{ products?: ProductRow[]; error?: string }>(pr);
      const cj = await readJson<{ categories?: CategoryOpt[]; error?: string }>(cats);
      if (!pr.ok) throw new Error(pj.error ?? pr.statusText);
      if (!cats.ok) throw new Error(cj.error ?? cats.statusText);
      setProducts(pj.products ?? []);
      setCategories(cj.categories ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startNew() {
    setEditingId("__new__");
    setF({ ...emptyForm() });
  }

  function edit(p: ProductRow) {
    setEditingId(p.id);
    const attrs = p.attributes;
    let clothingRows: SizeRow[];
    if (
      p.vitrineType === "clothes" &&
      attrs &&
      Array.isArray(attrs.size) &&
      attrs.size.length > 0
    ) {
      clothingRows = attrs.size.map((label) => ({
        label,
        qty: String(attrs.sizeStock?.[label] ?? 0),
      }));
    } else {
      clothingRows = presetToRows("tops");
    }
    const labels = clothingRows.map((r) => r.label);
    const sizeGridKind = initialFormSizeGridKind(attrs, p.categoryIds, labels);
    setF({
      title: p.title,
      vitrineType: p.vitrineType,
      categoryIds: [...p.categoryIds],
      price: String(p.price),
      unitLabel: p.unitLabel,
      stockQty: String(p.stockQty),
      description: p.description ?? "",
      imageUrls: [...(p.images ?? [])],
      inStock: p.inStock,
      sizeGridKind,
      sizeRows: clothingRows,
    });
  }

  function toggleCat(id: string) {
    setF((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((x) => x !== id)
        : [...prev.categoryIds, id],
    }));
  }

  async function save() {
    setErr(null);
    const parsedPrice = Number(f.price.replace(",", "."));
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setErr("Укажите корректную цену");
      return;
    }

    const isClothes = f.vitrineType === "clothes";
    let stockQtyParsed = Number(f.stockQty.replace(",", "."));
    let attributesPayload: Record<string, unknown>;

    if (isClothes) {
      const rows = f.sizeRows.map((r) => ({ label: r.label.trim(), qty: r.qty.replace(",", ".").trim() })).filter((r) => r.label.length > 0);
      if (rows.length === 0) {
        setErr("Для одежды добавьте хотя бы один размер (строка с названием размера).");
        return;
      }
      const seen = new Set<string>();
      for (const r of rows) {
        if (seen.has(r.label)) {
          setErr(`Размер «${r.label}» указан дважды — оставьте одну строку.`);
          return;
        }
        seen.add(r.label);
        const q = Number(r.qty);
        if (!Number.isFinite(q) || q < 0 || !Number.isInteger(q)) {
          setErr(`Некорректный остаток для размера «${r.label}» — целое число ≥ 0.`);
          return;
        }
      }
      const size = rows.map((r) => r.label);
      const sizeStock: Record<string, number> = {};
      let sum = 0;
      for (const r of rows) {
        const q = Math.floor(Number(r.qty));
        sizeStock[r.label] = q;
        sum += q;
      }
      const savedKind: SizeGridKind =
        f.sizeGridKind === "custom"
          ? "custom"
          : rowLabelsFitPresetSubset(f.sizeGridKind, size)
            ? f.sizeGridKind
            : "custom";
      attributesPayload = { size, sizeStock, sizeGridKind: savedKind };
      stockQtyParsed = sum;
    } else {
      if (!Number.isFinite(stockQtyParsed) || stockQtyParsed < 0 || !Number.isInteger(stockQtyParsed)) {
        setErr("Остаток — целое число ≥ 0");
        return;
      }
      attributesPayload = {};
    }

    const body = {
      title: f.title.trim(),
      vitrineType: f.vitrineType,
      categoryIds: f.categoryIds,
      price: Math.round(parsedPrice),
      unitLabel: f.unitLabel.trim(),
      stockQty: stockQtyParsed,
      description: f.description.trim() || undefined,
      images: f.imageUrls,
      inStock: f.inStock || stockQtyParsed > 0,
      attributes: attributesPayload,
    };

    try {
      if (editingId === "__new__") {
        const res = await apiFetch("/api/seller/products", { method: "POST", body: JSON.stringify(body) });
        const j = await readJson<{ error?: string }>(res);
        if (!res.ok) throw new Error(j.error ?? res.statusText);
      } else if (editingId) {
        const res = await apiFetch(`/api/seller/products/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        const j = await readJson<{ error?: string }>(res);
        if (!res.ok) throw new Error(j.error ?? res.statusText);
      }
      await load();
      startNew();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  }

  async function pickImages(files: FileList | null) {
    if (!files?.length || uploadBusy) return;
    setErr(null);
    setUploadBusy(true);
    try {
      const urls = await uploadSellerProductImages(Array.from(files));
      setF((x) => ({ ...x, imageUrls: [...x.imageUrls, ...urls] }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не удалось загрузить файлы");
    } finally {
      setUploadBusy(false);
    }
  }

  function removeImageAt(idx: number) {
    setF((x) => ({ ...x, imageUrls: x.imageUrls.filter((_, i) => i !== idx) }));
  }

  async function deleteProduct(id: string) {
    if (!confirm(`Удалить товар ${id}?`)) return;
    const res = await apiFetch(`/api/seller/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await readJson<{ error?: string }>(res).catch(() => ({ error: res.statusText }));
      setErr(j.error ?? res.statusText);
      return;
    }
    await load();
    startNew();
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Товары</h1>
          <p className="text-sm text-slate-600">Управление ассортиментом вашего магазина.</p>
        </div>
        <button type="button" onClick={startNew} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          Новый товар
        </button>
      </div>

      <div className="grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-100 text-sm font-semibold bg-slate-50">Все SKU</div>
          {loading ? (
            <p className="p-4 text-slate-500">Загрузка…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2">Название</th>
                    <th className="px-4 py-2">Цена</th>
                    <th className="px-4 py-2">Остаток</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className={`hover:bg-slate-50 ${editingId === p.id ? "bg-emerald-50/60" : ""}`}>
                      <td className="px-4 py-2 font-medium max-w-[200px]">
                        <span className="line-clamp-2">{p.title}</span>
                        {p.vitrineType === "clothes" ? (
                          <span className="block text-[10px] text-slate-400 font-normal normal-case mt-0.5">Одежда</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{p.price} ₽</td>
                      <td className="px-4 py-2 text-xs text-slate-700 max-w-[220px]">
                        <span className="line-clamp-2" title={stockSummary(p)}>
                          {stockSummary(p)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button type="button" onClick={() => edit(p)} className="text-emerald-700 font-medium mr-2">
                          Изменить
                        </button>
                        <button type="button" onClick={() => deleteProduct(p.id)} className="text-red-600">
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">{editingId === "__new__" ? "Новый товар" : "Редактирование"}</h2>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <label className="block">
            <span className="text-xs text-slate-600">Название</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />
          </label>

          <label className="block">
            <span className="text-xs text-slate-600">Витрина (тип)</span>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={f.vitrineType}
              onChange={(e) => {
                const v = e.target.value;
                setF((prev) => ({
                  ...prev,
                  vitrineType: v,
                  ...(v === "clothes" && prev.vitrineType !== "clothes"
                    ? { sizeRows: presetToRows("tops"), sizeGridKind: "tops" as SizeGridKind }
                    : {}),
                }));
              }}
            >
              {VITRINE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs text-slate-700 font-medium">Категории товара</p>
              <Link to="/edit-categories" className="text-xs text-slate-600 hover:text-slate-900 underline">
                Редактировать категории
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Нажмите метку, чтобы привязать к карточке. С маленьким маркером — ваши категории из раздела «Редактирование категорий».
            </p>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  title={c.editable ? "Своя категория" : "Общая категория"}
                  onClick={() => toggleCat(c.id)}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                    f.categoryIds.includes(c.id) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 text-slate-800"
                  } ${c.editable && !f.categoryIds.includes(c.id) ? "border-slate-400" : ""}`}
                >
                  {c.editable ? (
                    <span
                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${f.categoryIds.includes(c.id) ? "bg-white/90" : "bg-slate-500"}`}
                      aria-hidden
                    />
                  ) : null}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-600">Цена (₽)</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={f.price} onChange={(e) => setF((x) => ({ ...x, price: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-xs text-slate-600">Единица</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={f.unitLabel} onChange={(e) => setF((x) => ({ ...x, unitLabel: e.target.value }))} />
            </label>
          </div>

          {f.vitrineType === "clothes" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-800">Размеры и остатки (обязательно для одежды)</p>
                <p className="text-[11px] text-slate-600">
                  Всего единиц: <span className="font-bold tabular-nums">{clothesStockPreview}</span> (пересчёт при сохранении)
                </p>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Сначала выберите тип сетки (футболка, обувь, шапка и т.д.) — подставятся типичные размеры. Затем отредактируйте подписи и остатки по строкам или добавьте свои размеры.
              </p>
              <div>
                <p className="text-[10px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Конструктор сетки</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SIZE_GRID_PRESETS.filter((pr) => pr.selectable).map((preset) => {
                    const active = f.sizeGridKind === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${
                          active
                            ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-300/80"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          setF((prev) => ({
                            ...prev,
                            sizeGridKind: preset.id,
                            sizeRows: mergePresetWithExistingQty(preset.id as Exclude<SizeGridKind, "custom">, prev.sizeRows),
                          }))
                        }
                      >
                        <span className="text-xs font-semibold text-slate-900 block leading-snug">{preset.title}</span>
                        <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">{preset.shortHint}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${
                      f.sizeGridKind === "custom"
                        ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-300/80"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => setF((prev) => ({ ...prev, sizeGridKind: "custom" }))}
                  >
                    <span className="text-xs font-semibold text-slate-900 block leading-snug">Своя сетка</span>
                    <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">Любые подписи размеров вручную</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={f.categoryIds.length === 0}
                  title={f.categoryIds.length === 0 ? "Отметьте хотя бы одну категорию выше" : undefined}
                  className="text-xs px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => {
                    const k = inferSizeGridKind(f.categoryIds);
                    setF((prev) => ({
                      ...prev,
                      sizeGridKind: k,
                      sizeRows: mergePresetWithExistingQty(k, prev.sizeRows),
                    }));
                  }}
                >
                  Подставить сетку по категориям
                </button>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  onClick={() => setF((prev) => ({ ...prev, sizeRows: [...prev.sizeRows, { label: "", qty: "0" }] }))}
                >
                  + Строка размера
                </button>
              </div>
              <div className="space-y-2">
                {f.sizeRows.map((row, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2">
                    <input
                      className="border rounded-lg px-2 py-1.5 text-sm w-24"
                      placeholder="Размер"
                      value={row.label}
                      onChange={(e) =>
                        setF((prev) => ({
                          ...prev,
                          sizeRows: prev.sizeRows.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)),
                        }))
                      }
                    />
                    <span className="text-xs text-slate-500">шт.</span>
                    <input
                      className="border rounded-lg px-2 py-1.5 text-sm w-20 tabular-nums"
                      inputMode="numeric"
                      placeholder="0"
                      value={row.qty}
                      onChange={(e) =>
                        setF((prev) => ({
                          ...prev,
                          sizeRows: prev.sizeRows.map((r, i) => (i === idx ? { ...r, qty: e.target.value } : r)),
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline disabled:opacity-40"
                      disabled={f.sizeRows.length <= 1}
                      onClick={() =>
                        setF((prev) => ({
                          ...prev,
                          sizeRows: prev.sizeRows.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Убрать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <label className="block">
              <span className="text-xs text-slate-600">Остаток на складе</span>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={f.stockQty}
                onChange={(e) => setF((x) => ({ ...x, stockQty: e.target.value }))}
              />
            </label>
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={f.inStock} onChange={(e) => setF((x) => ({ ...x, inStock: e.target.checked }))} />
            В продаже
          </label>

          <div>
            <p className="text-xs text-slate-600 mb-1">Фотографии товара</p>
            <p className="text-xs text-slate-400 mb-2">Только загрузка с устройства (JPEG, PNG, GIF, WebP, до 5 МБ каждое, до 12 за раз).</p>
            {f.imageUrls.length > 0 ? (
              <ul className="flex flex-wrap gap-2 mb-3">
                {f.imageUrls.map((url, idx) => (
                  <li key={`${url}-${idx}`} className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      title="Убрать"
                      onClick={() => removeImageAt(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/65 text-white text-xs leading-5 hover:bg-black/85"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 mb-2">Ещё нет загруженных фото.</p>
            )}
            <label className="inline-flex">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                multiple
                className="sr-only"
                disabled={uploadBusy}
                onChange={(e) => {
                  pickImages(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="cursor-pointer px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 inline-block">
                {uploadBusy ? "Загрузка…" : "Выбрать файлы"}
              </span>
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-slate-600">Описание</span>
            <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={f.description} onChange={(e) => setF((x) => ({ ...x, description: e.target.value }))} />
          </label>

          <button type="button" onClick={save} className="w-full py-2 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
