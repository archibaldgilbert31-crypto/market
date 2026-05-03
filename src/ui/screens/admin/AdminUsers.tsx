import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/ui/state/authStore";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

import { API_BASE_URL } from "@/ui/constants/apiBase";

const API = `${API_BASE_URL}/api/admin`;
const ROLES = ["USER", "SELLER", "ADMIN"] as const;
const ROLE_BADGE: Record<string, string> = {
  USER: "bg-gray-100 text-gray-700",
  SELLER: "bg-blue-50 text-blue-700",
  ADMIN: "bg-red-50 text-red-700",
};

export function AdminUsers() {
  const { accessToken } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/users?limit=50`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const changeRole = async (userId: string, role: string) => {
    if (!accessToken) return;
    try {
      await fetch(`${API}/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ role }),
      });
      await loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p className="text-gray-500 py-8 text-center">Загрузка пользователей...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <span className="text-sm text-gray-500">Всего: {total}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Имя</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Роль</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Дата регистрации</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${ROLE_BADGE[u.role] ?? ""}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-[var(--fresh-green)]"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
