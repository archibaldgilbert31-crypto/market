import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { BarChart3, Wallet } from "lucide-react";
import { Header } from "@/ui/shared/Header";
import { loginPathWithReturn } from "@/ui/auth/returnPath";
import { useAuthStore } from "@/ui/state/authStore";

export function SellerCabinetLayout() {
  const nav = useNavigate();
  const { user, accessToken, fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) fetchMe();
  }, [accessToken, user, fetchMe]);

  useEffect(() => {
    if (isLoading || !accessToken) return;
    if (!user) {
      nav(loginPathWithReturn("/seller-cabinet"), { replace: true });
      return;
    }
    if (user.role !== "SELLER") {
      nav("/profile", { replace: true });
      return;
    }
  }, [user, accessToken, isLoading, nav]);

  if (!accessToken || (isLoading && !user)) {
    return (
      <div
        className="min-h-screen bg-[var(--fresh-bg)] flex items-center justify-center px-6"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <p className="text-sm text-gray-600">Загрузка…</p>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return null;
  }

  const tabCls = ({ isActive }: { isActive: boolean }) =>
    `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
      isActive ? "bg-[var(--fresh-green)] text-white" : "text-gray-600 bg-white border border-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-[var(--fresh-bg)] pb-8" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <Header title="Мой магазин" onBack={() => nav("/profile")} />

      <div className="px-4 pt-3 pb-2 flex gap-2">
        <NavLink to="/seller-cabinet/analytics" className={tabCls} end={false}>
          <BarChart3 size={18} />
          Анализ
        </NavLink>
        <NavLink to="/seller-cabinet/finance" className={tabCls}>
          <Wallet size={18} />
          Финансы
        </NavLink>
      </div>

      <Outlet />

      <p className="px-6 pt-6 text-[11px] text-center text-gray-400 leading-relaxed">
        Редактирование каталога и остатков — в веб-админке продавца (папка admin-panel) на компьютере.
      </p>
    </div>
  );
}
