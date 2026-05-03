import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import { User, Mail, Phone, Lock, Loader2, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/ui/state/authStore";
import { safeReturnPath } from "@/ui/auth/returnPath";

export function RegisterAuth() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const returnTo = safeReturnPath(params.get("from"));
  const loginHref =
    params.get("from") != null
      ? `/login?from=${encodeURIComponent(safeReturnPath(params.get("from")))}`
      : "/login";
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function clearErrors() {
    clearError();
    setLocalError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) { setLocalError("Введите имя"); return; }
    if (!email.trim()) { setLocalError("Введите email"); return; }
    if (!phone.trim()) { setLocalError("Укажите номер телефона"); return; }
    if (password.length < 6) { setLocalError("Пароль должен быть не менее 6 символов"); return; }
    if (password !== confirm) { setLocalError("Пароли не совпадают"); return; }

    try {
      await register(email, password, name.trim(), phone.trim());
      nav(returnTo, { replace: true });
    } catch {
      // error is set in the store
    }
  }

  const displayError = localError || error;

  const inputCls =
    "w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[var(--fresh-green)] focus:ring-2 focus:ring-[var(--fresh-green)]/20 outline-none transition-all text-sm";

  return (
    <div className="min-h-screen bg-[var(--fresh-bg)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--fresh-green)] to-[var(--fresh-green-dark)] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShoppingBag size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Регистрация</h1>
          <p className="text-gray-500 mt-2">Создайте новый аккаунт</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4"
        >
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
              {displayError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); clearErrors(); }}
                placeholder="Иван Иванов"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                placeholder="example@mail.ru"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearErrors(); }}
                placeholder="+7 (999) 123-45-67"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
                placeholder="Минимум 6 символов"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Подтверждение пароля</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); clearErrors(); }}
                placeholder="Повторите пароль"
                className={inputCls}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[var(--fresh-green)] hover:brightness-105 active:scale-[0.98] text-white font-semibold text-base transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Регистрация…
              </>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Уже есть аккаунт?{" "}
          <Link to={loginHref} className="text-[var(--fresh-green)] font-semibold hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
