import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { normalizePhoneInput } from "./phone";
import { apiUrl, readJson, SELLER_ADMIN_TOKEN_KEY } from "../api";

export function LoginPage() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SELLER_ADMIN_TOKEN_KEY)) {
      nav("/", { replace: true });
    }
  }, [nav]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const normalized = normalizePhoneInput(phone);
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, password }),
      });
      const data = await readJson<{ accessToken?: string; error?: string; user?: { role?: string } }>(res);
      if (!res.ok || !data.accessToken) {
        setError(data.error ?? "Не удалось войти");
        return;
      }
      if (data.user?.role !== "SELLER") {
        setError("В этот кабинет могут войти только продавцы (SELLER).");
        return;
      }
      localStorage.setItem(SELLER_ADMIN_TOKEN_KEY, data.accessToken);
      nav("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось войти");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Вход продавца</h1>
        <p className="text-sm text-slate-500 mb-4">
          Отдельное Vite-приложение. Локально: backend на :3001, админка на :5180 с прокси <code className="text-slate-600">/api</code>.
        </p>
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 mb-6 text-[11px] text-slate-600 leading-snug space-y-1">
          <p>
            После сброса БД нужны демо-аккаунты: в каталоге <code className="text-slate-800">server</code> выполните{" "}
            <code className="text-slate-800">npm run db:seed</code>.
          </p>
          <p>
            Продавец «Провиант»: номер <span className="font-mono text-slate-800">+79110000001</span>, пароль{" "}
            <span className="font-mono text-slate-800">Seller123!</span> (англ.). У остальных магазинов тот же пароль и номера{" "}
            <span className="font-mono">+79110000002 …</span> по порядку в <code className="text-slate-800">catalog.json</code>.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Телефон</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 ..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              autoComplete="tel"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold"
          >
            {busy ? "Входим…" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
