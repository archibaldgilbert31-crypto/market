import { Bell, ChevronRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router";

export function Onboarding() {
  const nav = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[var(--fresh-green)] to-[var(--fresh-green-dark)] text-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-6xl">🛒</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">FreshDash</h1>
        <p className="text-lg text-white/90 mb-8 max-w-sm">
          Доставка продуктов и товаров за 15 минут. Свежее, быстрое, удобное.
        </p>
      </div>

      <div className="bg-white rounded-t-[32px] px-6 py-8 text-gray-900">
        <h2 className="text-xl font-semibold mb-6">Разрешения для работы</h2>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-[var(--fresh-green)] rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Геолокация</h3>
              <p className="text-sm text-gray-600">
                Для определения адреса доставки и ближайших магазинов
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-[var(--fresh-green)] rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Уведомления</h3>
              <p className="text-sm text-gray-600">
                Сообщим о статусе заказа, акциях и спецпредложениях
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => nav("/home")}
          className="w-full bg-[var(--fresh-green)] text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
        >
          Продолжить <ChevronRight size={20} />
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Нажимая «Продолжить», вы соглашаетесь с условиями использования и политикой конфиденциальности
        </p>
      </div>
    </div>
  );
}

