import { useEffect, useState } from "react";
import { Users, ShoppingBag, Activity, Package, Store } from "lucide-react";
import { useAuthStore } from "@/ui/state/authStore";

interface Stats {
  totalUsers: number;
  totalSessions: number;
  totalOrders: number;
  totalProducts: number;
  totalSellers: number;
  roleBreakdown: { role: string; count: number }[];
}

import { API_BASE_URL } from "@/ui/constants/apiBase";

const API = `${API_BASE_URL}/api/admin`;

const ROLE_LABELS: Record<string, string> = { USER: "Покупатели", SELLER: "Продавцы", ADMIN: "Администраторы" };

export function AdminDashboard() {
  const { accessToken } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API}/stats`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <p className="text-gray-500 py-8 text-center">Загрузка статистики...</p>;

  const cards = [
    { label: "Пользователей", value: stats?.totalUsers ?? 0, icon: <Users size={24} />, color: "bg-blue-50 text-blue-600" },
    { label: "Товаров", value: stats?.totalProducts ?? 0, icon: <Package size={24} />, color: "bg-violet-50 text-violet-600" },
    { label: "Магазинов", value: stats?.totalSellers ?? 0, icon: <Store size={24} />, color: "bg-amber-50 text-amber-700" },
    { label: "Активных сессий", value: stats?.totalSessions ?? 0, icon: <Activity size={24} />, color: "bg-green-50 text-green-600" },
    { label: "Заказов", value: stats?.totalOrders ?? 0, icon: <ShoppingBag size={24} />, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>{c.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {stats?.roleBreakdown && stats.roleBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">По ролям</h2>
          <div className="space-y-2">
            {stats.roleBreakdown.map((r) => (
              <div key={r.role} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{ROLE_LABELS[r.role] ?? r.role}</span>
                <span className="font-semibold text-gray-900">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
