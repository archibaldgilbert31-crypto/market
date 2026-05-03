import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import { useAuthStore } from "@/ui/state/authStore";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { safeReturnPath } from "@/ui/auth/returnPath";

export function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const returnTo = safeReturnPath(params.get("from"));
  const { login, isLoading, error, clearError } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(phone, password);
      nav(returnTo, { replace: true });
    } catch { /* error in store */ }
  };

  const rawFrom = params.get("from");
  const registerHref = rawFrom
    ? `/register-auth?from=${encodeURIComponent(safeReturnPath(rawFrom))}`
    : "/register-auth";

  return (
    <div className="min-h-screen bg-[var(--fresh-bg)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--fresh-green)] to-[var(--fresh-green-dark)] rounded-2xl flex items-center justify-center">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Вход в аккаунт</h1>
          <p className="text-sm text-gray-500 mt-1">Войдите, чтобы продолжить</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3" onClick={clearError}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+7 900 000-00-00"
              autoComplete="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[var(--fresh-green)] focus:ring-2 focus:ring-[var(--fresh-green)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Минимум 6 символов"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[var(--fresh-green)] focus:ring-2 focus:ring-[var(--fresh-green)]/20 transition-all"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[var(--fresh-green)] text-white font-semibold text-sm hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Нет аккаунта?{" "}
          <Link to={registerHref} className="text-[var(--fresh-green)] font-semibold hover:underline">
            Зарегистрироваться
          </Link>
        </p>

        <button onClick={() => nav("/home")} className="w-full text-center text-sm text-gray-400 mt-4 hover:text-gray-600 transition-colors">
          Продолжить без входа
        </button>
      </div>
    </div>
  );
}
