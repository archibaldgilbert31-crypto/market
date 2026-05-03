import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useAuthStore } from "@/ui/state/authStore";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export function Register() {
  const nav = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalErr("");

    if (password !== confirm) {
      setLocalErr("Пароли не совпадают");
      return;
    }
    if (!phone.trim()) {
      setLocalErr("Укажите номер телефона");
      return;
    }

    try {
      await register(email, password, name.trim(), phone.trim());
      nav("/profile");
    } catch { /* error in store */ }
  };

  const displayError = localErr || error;

  return (
    <div className="min-h-screen bg-[var(--fresh-bg)] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--fresh-green)] to-[var(--fresh-green-dark)] rounded-2xl flex items-center justify-center">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Регистрация</h1>
          <p className="text-sm text-gray-500 mt-1">Создайте аккаунт для покупок</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 cursor-pointer"
              onClick={() => { clearError(); setLocalErr(""); }}
            >
              {displayError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Иван Иванов"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[var(--fresh-green)] focus:ring-2 focus:ring-[var(--fresh-green)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@mail.ru"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[var(--fresh-green)] focus:ring-2 focus:ring-[var(--fresh-green)]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+7 (999) 123-45-67"
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
                minLength={6}
                placeholder="Минимум 6 символов"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[var(--fresh-green)] focus:ring-2 focus:ring-[var(--fresh-green)]/20 transition-all"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Подтвердите пароль</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="Повторите пароль"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[var(--fresh-green)] focus:ring-2 focus:ring-[var(--fresh-green)]/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[var(--fresh-green)] text-white font-semibold text-sm hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-[var(--fresh-green)] font-semibold hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
