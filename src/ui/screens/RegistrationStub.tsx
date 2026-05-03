import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function RegistrationStub() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const canContinue = fullName.trim() && phone.trim() && email.trim();

  return (
    <div className="bg-[var(--fresh-bg)]">
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Регистрация</h1>
        <p className="text-sm text-gray-600">
          Это заглушка для MVP — без SMS и без реальной проверки.
        </p>
      </div>

      <div className="px-4 space-y-3 pb-6">
        <label className="block">
          <span className="text-xs text-gray-500">ФИО</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иванов Иван Иванович"
            className="mt-1 w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--fresh-green)]"
          />
        </label>

        <label className="block">
          <span className="text-xs text-gray-500">Телефон</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 123-45-67"
            className="mt-1 w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--fresh-green)]"
          />
        </label>

        <label className="block">
          <span className="text-xs text-gray-500">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--fresh-green)]"
          />
        </label>
      </div>

      <div className="px-4 pb-8">
        <button
          onClick={() => nav("/home")}
          disabled={!canContinue}
          className="w-full bg-[var(--fresh-green)] disabled:opacity-50 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
        >
          Продолжить <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

