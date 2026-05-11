import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch, readJson } from "../api";

type CategoryOpt = { id: string; label: string; editable?: boolean };

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function CategoryEditPage() {
  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [catBusy, setCatBusy] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch("/api/seller/meta/categories");
      const cj = await readJson<{ categories?: CategoryOpt[]; error?: string }>(res);
      if (!res.ok) throw new Error(cj.error ?? res.statusText);
      setCategories(cj.categories ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const reloadCategories = useCallback(async () => {
    const res = await apiFetch("/api/seller/meta/categories");
    const cj = await readJson<{ categories?: CategoryOpt[]; error?: string }>(res);
    if (!res.ok) throw new Error(cj.error ?? res.statusText);
    setCategories(cj.categories ?? []);
  }, []);

  async function submitNewCategory() {
    const label = newCategoryLabel.trim();
    if (!label || catBusy) return;
    setCatBusy(true);
    setErr(null);
    try {
      const res = await apiFetch("/api/seller/meta/categories", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      const j = await readJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      setNewCategoryLabel("");
      setShowAddCategory(false);
      await reloadCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка категории");
    } finally {
      setCatBusy(false);
    }
  }

  async function saveRename(categoryId: string) {
    const label = renameDraft.trim();
    if (!label || catBusy) return;
    setCatBusy(true);
    setErr(null);
    try {
      const res = await apiFetch(`/api/seller/meta/categories/${encodeURIComponent(categoryId)}`, {
        method: "PATCH",
        body: JSON.stringify({ label }),
      });
      const j = await readJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      setRenamingId(null);
      await reloadCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setCatBusy(false);
    }
  }

  async function removeCategory(categoryId: string, label: string, isOwn: boolean) {
    const msg = isOwn
      ? `Удалить вашу категорию «${label}»? Она пропадёт из списка и будет снята со всех ваших товаров.`
      : `Убрать «${label}» из списка вашего магазина? Маркетплейс для других продавцов не меняется; метка будет снята с ваших товаров.`;
    if (!confirm(msg)) return;
    setCatBusy(true);
    setErr(null);
    try {
      const res = await apiFetch(`/api/seller/meta/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
      const j = await readJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(j.error ?? res.statusText);
      setRenamingId(null);
      await reloadCategories();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка удаления");
    } finally {
      setCatBusy(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Редактирование категорий</h1>
          <p className="text-sm text-slate-600 mt-1">
            Список меток для вашего магазина. Чтобы привязать категории к товарам, перейдите в раздел{" "}
            <Link to="/products" className="text-emerald-700 underline hover:text-emerald-800">
              Товары
            </Link>
            .
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка…</p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 space-y-3">
          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-700 font-medium">Категории магазина</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[28rem] leading-snug">
                С точкой в списке товаров — ваши категории; без — общие категории маркетплейса. Удаление общей только скрывает её у вашего магазина и снимает метку с ваших SKU.
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory((v) => !v);
                  setShowEditCategory(false);
                  setRenamingId(null);
                }}
                disabled={catBusy}
                title="Добавить категорию"
                aria-label="Добавить категорию"
                className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 text-lg font-medium leading-none hover:bg-slate-50 disabled:opacity-40"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditCategory((v) => !v);
                  setShowAddCategory(false);
                  setRenamingId(null);
                }}
                disabled={catBusy || categories.length === 0}
                title="Показать список для правки"
                aria-label="Редактировать категории"
                className={`flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 ${showEditCategory ? "bg-slate-100" : ""}`}
              >
                <PencilIcon />
              </button>
            </div>
          </div>

          {showAddCategory ? (
            <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 flex flex-wrap gap-2 items-end">
              <label className="flex-1 min-w-[180px]">
                <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Название новой категории</span>
                <input
                  className="mt-1 w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-white"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  placeholder="Например, Фермерские сыры"
                  maxLength={120}
                  disabled={catBusy}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submitNewCategory();
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => void submitNewCategory()}
                disabled={catBusy || !newCategoryLabel.trim()}
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-40"
              >
                {catBusy ? "…" : "Создать"}
              </button>
            </div>
          ) : null}

          {showEditCategory ? (
            <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 space-y-2">
              <p className="text-[11px] font-medium text-slate-600">Список категорий магазина</p>
              {categories.length === 0 ? (
                <p className="text-xs text-slate-500">Нет доступных категорий.</p>
              ) : (
                <ul className="space-y-1.5 max-h-[min(24rem,calc(100vh-16rem))] overflow-y-auto pr-1">
                  {categories.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-2 text-sm bg-white rounded border border-slate-100 px-2 py-1.5">
                      {renamingId === c.id ? (
                        <>
                          <input
                            className="flex-1 min-w-[120px] border border-slate-200 rounded px-2 py-1 text-sm"
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            maxLength={120}
                            disabled={catBusy}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void saveRename(c.id);
                            }}
                          />
                          <button
                            type="button"
                            disabled={catBusy || !renameDraft.trim()}
                            onClick={() => void saveRename(c.id)}
                            className="text-slate-700 font-medium text-xs hover:underline"
                          >
                            Сохранить
                          </button>
                          <button type="button" disabled={catBusy} onClick={() => setRenamingId(null)} className="text-slate-500 text-xs">
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1.5 min-w-0 flex-1">
                            <span
                              className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-medium ${c.editable ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-500"}`}
                            >
                              {c.editable ? "Моя" : "Общая"}
                            </span>
                            <span className="font-medium text-slate-900 truncate">{c.label}</span>
                          </span>
                          {c.editable ? (
                            <button
                              type="button"
                              disabled={catBusy}
                              onClick={() => {
                                setRenamingId(c.id);
                                setRenameDraft(c.label);
                              }}
                              className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
                            >
                              Переименовать
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={catBusy}
                            onClick={() => void removeCategory(c.id, c.label, Boolean(c.editable))}
                            className="text-xs text-red-600 hover:underline ml-auto"
                          >
                            Удалить
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
