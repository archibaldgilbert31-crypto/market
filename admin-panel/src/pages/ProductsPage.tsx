import { useCallback, useEffect, useState } from "react";
import { apiFetch, readJson, uploadSellerProductImages } from "../api";

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
};

type CategoryOpt = { id: string; label: string };

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

const emptyForm = () => ({
  title: "",
  vitrineType: "clothes" as string,
  categoryIds: [] as string[],
  price: "",
  unitLabel: "шт.",
  stockQty: "10",
  description: "",
  imageUrls: [] as string[],
  inStock: true,
});

export function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>("__new__");

  type FormShape = ReturnType<typeof emptyForm>;
  const [f, setF] = useState<FormShape>(() => emptyForm());

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
    const stock = Number(f.stockQty.replace(",", "."));
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      setErr("Остаток — целое число ≥ 0");
      return;
    }

    const body = {
      title: f.title.trim(),
      vitrineType: f.vitrineType,
      categoryIds: f.categoryIds,
      price: Math.round(parsedPrice),
      unitLabel: f.unitLabel.trim(),
      stockQty: stock,
      description: f.description.trim() || undefined,
      images: f.imageUrls,
      inStock: f.inStock || stock > 0,
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
                      <td className="px-4 py-2 font-medium">{p.title}</td>
                      <td className="px-4 py-2">{p.price} ₽</td>
                      <td className="px-4 py-2">{p.stockQty}</td>
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
              onChange={(e) => setF((x) => ({ ...x, vitrineType: e.target.value }))}
            >
              {VITRINE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="text-xs text-slate-600 mb-1">Категории (из каталога)</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCat(c.id)}
                  className={`text-xs px-2 py-1 rounded-full border ${f.categoryIds.includes(c.id) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200"}`}
                >
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

          <label className="block">
            <span className="text-xs text-slate-600">Остаток на складе</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={f.stockQty} onChange={(e) => setF((x) => ({ ...x, stockQty: e.target.value }))} />
          </label>

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
