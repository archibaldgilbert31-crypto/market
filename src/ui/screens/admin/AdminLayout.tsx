import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Users, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/ui/state/authStore";

export function AdminLayout() {
  const nav = useNavigate();
  const { user, accessToken, fetchMe } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) fetchMe();
  }, [accessToken, user, fetchMe]);

  useEffect(() => {
    if (!accessToken) {
      nav("/login");
      return;
    }
    if (user && user.role !== "ADMIN") {
      nav("/home");
    }
  }, [user, accessToken, nav]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  const links = [
    { to: "/admin", label: "Дашборд", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin/users", label: "Пользователи", icon: <Users size={18} />, end: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => nav("/home")} className="text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <ShieldCheck size={22} className="text-[var(--fresh-green)]" />
          <span className="font-bold text-lg text-gray-900">Админ-панель</span>

          <nav className="ml-8 flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-[var(--fresh-green)]/10 text-[var(--fresh-green)]" : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                {l.icon}
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto text-sm text-gray-500">{user.email}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
