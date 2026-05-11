import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { apiFetch, readJson, SELLER_ADMIN_TOKEN_KEY } from "../api";

export function SellerLayout({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const [shopName, setShopName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch("/api/auth/me");
      let data: { user?: { email?: string; role?: string; sellerShop?: { id: string; name: string } | null } };
      try {
        data = await readJson<{ user?: { email?: string; role?: string; sellerShop?: { id: string; name: string } | null } }>(
          res,
        );
      } catch {
        if (cancelled) return;
        localStorage.removeItem(SELLER_ADMIN_TOKEN_KEY);
        nav("/login");
        return;
      }
      if (cancelled) return;
      if (!res.ok) {
        localStorage.removeItem(SELLER_ADMIN_TOKEN_KEY);
        nav("/login");
        return;
      }
      if (data.user?.role !== "SELLER") {
        setRoleError("Доступ только для продавцов (роль SELLER).");
        return;
      }
      const name = data.user?.sellerShop?.name?.trim();
      setShopName(name ?? "");
      setLoginEmail(data.user?.email ?? "");
    })();
    return () => {
      cancelled = true;
    };
  }, [nav]);

  const headerTitle = shopName || loginEmail || "Магазин";

  const logout = () => {
    localStorage.removeItem(SELLER_ADMIN_TOKEN_KEY);
    nav("/login");
  };

  if (roleError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
          <p className="text-red-600 font-medium mb-2">{roleError}</p>
          <button type="button" onClick={logout} className="mt-2 text-sm text-slate-600 underline">
            Выйти
          </button>
        </div>
      </div>
    );
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-100"}`;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Кабинет продавца</p>
          <p className="text-sm font-semibold truncate leading-snug" title={shopName ? `${shopName} · ${loginEmail}` : loginEmail}>
            {headerTitle}
          </p>
          {shopName ? (
            <p className="text-[11px] text-slate-400 truncate mt-1.5" title={loginEmail}>
              {loginEmail}
            </p>
          ) : null}
        </div>
        <nav className="p-3 space-y-1 flex-1">
          <NavLink to="/products" className={linkCls}>
            Товары
          </NavLink>
          <NavLink to="/edit-categories" className={linkCls}>
            Редактирование категорий
          </NavLink>
          <NavLink to="/analytics" className={linkCls}>
            Анализ
          </NavLink>
          <NavLink to="/finance" className={linkCls}>
            Финансы
          </NavLink>
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button type="button" onClick={logout} className="text-sm text-slate-600 hover:text-slate-900 w-full text-left px-3 py-2">
            Выход
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
