import { useEffect, useState } from "react";
import { Bell, CreditCard, Heart, HelpCircle, LogIn, LogOut, MapPin, Settings, ChevronRight, Shield, Store, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { Header } from "@/ui/shared/Header";
import { useAuthStore } from "@/ui/state/authStore";
import { loginPathWithReturn, registerPathWithReturn } from "@/ui/auth/returnPath";
import { sellerCabinetFetch } from "@/ui/api/sellerCabinetFetch";
import { formatRub } from "@/ui/screens/seller-cabinet/formatRub";

export function Profile() {
  const nav = useNavigate();
  const { user, isLoading, logout, fetchMe, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) fetchMe();
  }, [accessToken, user, fetchMe]);

  const handleLogout = async () => {
    await logout();
    nav("/home");
  };

  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState(false);

  useEffect(() => {
    if (user?.role !== "SELLER") {
      setTodayRevenue(null);
      setRevenueError(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setRevenueLoading(true);
      setRevenueError(false);
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      const q = `/api/seller/finance/summary?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
      try {
        const res = await sellerCabinetFetch(q);
        const j = (await res.json()) as { revenueRub?: number };
        if (cancelled) return;
        if (res.ok && typeof j.revenueRub === "number") {
          setTodayRevenue(j.revenueRub);
        } else {
          setTodayRevenue(null);
          setRevenueError(true);
        }
      } catch {
        if (!cancelled) {
          setTodayRevenue(null);
          setRevenueError(true);
        }
      } finally {
        if (!cancelled) setRevenueLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.role, user?.id]);

  const menu = [
    ...(user?.role !== "SELLER"
      ? [{ icon: <MapPin size={20} />, label: "Мои адреса", action: () => nav("/addresses") }]
      : []),
    ...(user?.role === "SELLER"
      ? [{ icon: <Store size={20} />, label: "Мой магазин", action: () => nav("/seller-cabinet") }]
      : []),
    { icon: <Heart size={20} />, label: "Избранное", action: () => nav("/favorites") },
    { icon: <CreditCard size={20} />, label: "Способы оплаты", action: () => alert("Скоро") },
    { icon: <Bell size={20} />, label: "Уведомления", badge: "3", action: () => alert("Скоро") },
    { icon: <HelpCircle size={20} />, label: "Помощь и поддержка", action: () => alert("Скоро") },
    { icon: <Settings size={20} />, label: "Настройки", action: () => alert("Скоро") },
  ];

  if (user?.role === "ADMIN") {
    menu.push({ icon: <Shield size={20} />, label: "Админ-панель", action: () => nav("/admin"), badge: undefined as any });
  }

  const initials = user ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??";

  if (!user && !isLoading) {
    return (
      <div className="bg-[var(--fresh-bg)]">
        <Header title="Профиль" onBack={() => nav("/home")} />
        <div className="px-4 py-12 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
            <LogIn size={32} className="text-gray-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Вы не авторизованы</h2>
            <p className="text-sm text-gray-500">Войдите или зарегистрируйтесь, чтобы управлять заказами и профилем</p>
          </div>
          <button
            onClick={() => nav(loginPathWithReturn("/profile"))}
            className="w-full max-w-xs py-3.5 rounded-xl bg-[var(--fresh-green)] text-white font-semibold text-sm hover:brightness-105 active:scale-[0.98] transition-all"
          >
            Войти в аккаунт
          </button>
          <button
            onClick={() => nav(registerPathWithReturn("/profile"))}
            className="text-sm text-[var(--fresh-green)] font-semibold hover:underline"
          >
            Создать аккаунт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--fresh-bg)]">
      <Header title="Профиль" onBack={() => nav("/home")} />

      <div className="px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--fresh-green)] to-[var(--fresh-green-dark)] rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{user?.name ?? "Загрузка..."}</h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
              {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
            </div>
          </div>

          {user?.role === "SELLER" ? (
            <div className="rounded-2xl overflow-hidden shadow-lg shadow-[var(--fresh-green)]/15 ring-1 ring-white/25">
              <div className="bg-gradient-to-br from-[var(--fresh-green)] via-[var(--fresh-green)] to-[var(--fresh-green-dark)] p-5 text-white relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white/85 tracking-wide">Выручка сегодня</p>
                    <p className="text-[11px] text-white/65 mt-0.5">Только календарные сутки, по вашим строкам заказов</p>
                  </div>
                  <div className="rounded-xl bg-white/20 p-2.5 shrink-0">
                    <TrendingUp size={22} className="text-white" aria-hidden />
                  </div>
                </div>
                <div className="relative mt-4 min-h-[2.75rem] flex items-end">
                  {revenueLoading ? (
                    <div className="h-10 w-40 rounded-lg bg-white/20 animate-pulse" />
                  ) : revenueError ? (
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-white/90">—</p>
                      <p className="text-xs text-white/60">Не удалось загрузить. Проверьте сеть или откройте экран позже.</p>
                    </div>
                  ) : (
                    <p className="text-[1.85rem] font-bold tabular-nums tracking-tight">
                      {formatRub(todayRevenue ?? 0)} <span className="text-lg font-semibold opacity-90">₽</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                ["0", "Заказов"],
                ["0", "Баллов"],
                ["0%", "Кэшбэк"],
              ].map(([value, label]) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-[var(--fresh-green)]">{value}</p>
                  <p className="text-xs text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {menu.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="text-gray-700">{item.icon}</div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {"badge" in item && item.badge && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                  {item.badge}
                </span>
              )}
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Выйти из аккаунта</span>
        </button>

        <p className="text-xs text-gray-500 text-center">Версия 0.1 • Marketplace © 2026</p>
      </div>
    </div>
  );
}
