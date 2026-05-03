import type { StorefrontSectionDef } from "./types";

/**
 * Фиксированный цвет для каждой категории товаров.
 * Одна категория = один цвет во всём приложении.
 */
const C = {
  // ── Продукты питания ──
  dairy:           "bg-[#dbeafe]",  // голубой
  fruits:          "bg-[#d9f99d]",  // салатовый
  drinks:          "bg-[#cffafe]",  // мятный
  vegetables:      "bg-[#bbf7d0]",  // зелёный
  greens:          "bg-[#ecfccb]",  // лаймовый
  grocery:         "bg-[#fed7aa]",  // оранжевый
  bakery:          "bg-[#fef3c7]",  // жёлтый
  soups:           "bg-[#fecaca]",  // красноватый
  second_courses:  "bg-[#ffedd5]",  // персиковый
  salads:          "bg-[#a7f3d0]",  // изумрудный
  ready_food:      "bg-[#fde68a]",  // тёплый жёлтый
  deli:            "bg-[#ffe4e6]",  // розовый
  sauces:          "bg-[#fda4af]",  // коралловый
  meat:            "bg-[#fecaca]",  // красноватый
  fish:            "bg-[#bae6fd]",  // небесный
  frozen:          "bg-[#e0f2fe]",  // ледяной голубой
  sweets:          "bg-[#fbcfe8]",  // конфетно-розовый
  chocolate:       "bg-[#d4a574]",  // шоколадный
  snacks:          "bg-[#fde68a]",  // жёлтый хрустящий
  tea_coffee:      "bg-[#d6b08e]",  // кофейный
  canned:          "bg-[#e7e5e4]",  // тёплый серый
  household:       "bg-[#a5f3fc]",  // яркий бирюзовый
  baby:            "bg-[#fbcfe8]",  // детский розовый
  pet:             "bg-[#fcd34d]",  // солнечный жёлтый
  alcohol:         "bg-[#c4b5fd]",  // виноградный
  oil_spice:       "bg-[#fef3c7]",  // жёлтый (специи)
  pasta_cereal:    "bg-[#fed7aa]",  // оранжевый (крупы)
  eggs:            "bg-[#fef9c3]",  // бледно-жёлтый

  // ── Одежда ──
  outerwear:       "bg-[#e0e7ff]",  // голубовато-лавандовый
  tshirts:         "bg-[#fce7f3]",  // нежно-розовый
  shoes:           "bg-[#e2e8f0]",  // серо-голубой
  headwear:        "bg-[#ffedd5]",  // персиковый
  accessories:     "bg-[#ede9fe]",  // лиловый

  // ── Инструменты ──
  hand_tools:      "bg-[#fef3c7]",  // жёлтый
  power_tools:     "bg-[#fdba74]",  // тёмно-оранжевый
  tools:           "bg-[#e7e5e4]",  // тёплый серый
  components:      "bg-[#bae6fd]",  // небесный
  washing_machine: "bg-[#bae6fd]",  // небесный
  fridge:          "bg-[#cffafe]",  // мятный

  // ── Электроника ──
  gadgets:         "bg-[#ede9fe]",  // лиловый
  watches:         "bg-[#dbeafe]",  // голубой
  personal_care:   "bg-[#fce7f3]",  // нежно-розовый
  electronics:     "bg-[#f3e8ff]",  // сиреневый

  // ── Подборки ──
  discount:        "bg-[#dcfce7]",  // свежий зелёный
  spring:          "bg-[#d1fae5]",  // весенний зелёный
  summer:          "bg-[#bae6fd]",  // летний голубой
  basic:           "bg-[#e5e7eb]",  // нейтральный серый
  neutral:         "bg-[#f1f5f9]",  // светло-серый
  trending:        "bg-[#ddd6fe]",  // фиолетовый
  new_arrivals:    "bg-[#fecdd3]",  // розово-красный
  sport:           "bg-[#bae6fd]",  // голубой
  premium:         "bg-[#ede9fe]",  // лавандовый
  gift:            "bg-[#fae8ff]",  // сиреневый
  combo:           "bg-[#e0e7ff]",  // синеватый
  all:             "bg-[#f1f5f9]",  // серый
} as const;

export const STOREFRONT_SECTIONS: Record<string, StorefrontSectionDef[]> = {
  /* ═══════════════  ПРОВИАНТ (seller-1)  ═══════════════ */
  "seller-1": [
    {
      title: "Акции и подборки",
      rows: [
        [
          { title: "Успей купить", bgClass: C.discount, discountBadge: "−25%", categoryIds: ["dairy", "fruits"], colSpan: 1, image: "/assets/pngcard/food/milk.png" },
          { title: "Скидки на молочку", bgClass: C.discount, discountBadge: "−20%", categoryIds: ["dairy"], colSpan: 1, image: "/assets/pngcard/food/cheese.png" },
          { title: "Новинки недели", bgClass: C.new_arrivals, categoryIds: [], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Молочные продукты, яйца",
      rows: [
        [
          { title: "Молоко и кефир", bgClass: C.dairy, categoryIds: ["milk"], colSpan: 2, image: "/assets/pngcard/food/milk.png" },
          { title: "Яйца", bgClass: C.eggs, categoryIds: ["eggs"], colSpan: 1, image: "/assets/pngcard/food/eggs.png" },
        ],
        [
          { title: "Сыры", bgClass: C.dairy, categoryIds: ["cheese"], colSpan: 1, image: "/assets/pngcard/food/cheese.png" },
          { title: "Масло и сметана", bgClass: C.dairy, categoryIds: ["butter_spread"], colSpan: 1 },
          { title: "Йогурты и творог", bgClass: C.dairy, categoryIds: ["yogurt_cottage"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Фрукты и овощи",
      rows: [
        [
          { title: "Фрукты свежие", bgClass: C.fruits, categoryIds: ["fruits"], colSpan: 1 },
          { title: "Овощи", bgClass: C.vegetables, categoryIds: ["vegetables"], colSpan: 1 },
          { title: "Ягоды", bgClass: C.fruits, categoryIds: ["fruits"], colSpan: 1 },
        ],
        [
          { title: "Зелень и салаты", bgClass: C.greens, categoryIds: ["greens"], colSpan: 1 },
          { title: "Экзотика", bgClass: C.fruits, categoryIds: ["fruits"], colSpan: 1 },
          { title: "Грибы", bgClass: C.vegetables, categoryIds: ["vegetables"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Мясо, птица, рыба",
      rows: [
        [
          { title: "Мясо и птица", bgClass: C.meat, categoryIds: ["meat"], colSpan: 2, image: "/assets/pngcard/food/meat.png" },
          { title: "Рыба и морепродукты", bgClass: C.fish, categoryIds: ["fish"], colSpan: 1 },
        ],
        [
          { title: "Колбасы и сосиски", bgClass: C.meat, categoryIds: ["meat"], colSpan: 1, image: "/assets/pngcard/food/meat_slicing.png" },
          { title: "Фарш", bgClass: C.meat, categoryIds: ["meat"], colSpan: 1 },
          { title: "Деликатесы", bgClass: C.deli, categoryIds: ["deli"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Хлеб и выпечка",
      rows: [
        [
          { title: "Хлеб свежий", bgClass: C.bakery, categoryIds: ["bakery"], colSpan: 1 },
          { title: "Булочки и круассаны", bgClass: C.bakery, categoryIds: ["bakery"], colSpan: 1 },
          { title: "Лаваш и лепёшки", bgClass: C.bakery, categoryIds: ["bakery"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Бакалея",
      rows: [
        [
          { title: "Крупы и злаки", bgClass: C.pasta_cereal, categoryIds: ["grocery"], colSpan: 1 },
          { title: "Макароны", bgClass: C.pasta_cereal, categoryIds: ["grocery"], colSpan: 1 },
          { title: "Мука", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 1 },
        ],
        [
          { title: "Масло растительное", bgClass: C.oil_spice, categoryIds: ["grocery"], colSpan: 1 },
          { title: "Специи и приправы", bgClass: C.oil_spice, categoryIds: ["grocery"], colSpan: 1 },
          { title: "Сахар и соль", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Сладкое, торты",
      rows: [
        [
          { title: "Торты и пирожные", bgClass: C.sweets, categoryIds: ["sweets"], colSpan: 2 },
          { title: "Шоколад, конфеты, батончики", bgClass: C.chocolate, categoryIds: ["chocolate"], colSpan: 1, image: "/assets/pngcard/food/m&m.png" },
        ],
        [
          { title: "Мармелад, зефир, леденцы", bgClass: C.sweets, categoryIds: ["sweets"], colSpan: 1 },
          { title: "Печенье, вафли, пряники", bgClass: C.sweets, categoryIds: ["sweets"], colSpan: 1 },
          { title: "Полезные сладости", bgClass: C.fruits, categoryIds: ["sweets"], colSpan: 1 },
        ],
        [
          { title: "Восточные сладости", bgClass: C.chocolate, categoryIds: ["sweets"], colSpan: 1 },
          { title: "Варенье, мёд, сиропы", bgClass: C.bakery, categoryIds: ["sweets"], colSpan: 2 },
        ],
      ],
    },
    {
      title: "Напитки",
      rows: [
        [
          { title: "Соки и нектары", bgClass: C.drinks, categoryIds: ["drinks"], colSpan: 1 },
          { title: "Вода", bgClass: C.drinks, categoryIds: ["drinks"], colSpan: 1 },
          { title: "Лимонады и газировка", bgClass: C.drinks, categoryIds: ["drinks"], colSpan: 1 },
        ],
        [
          { title: "Чай", bgClass: C.tea_coffee, categoryIds: ["tea_coffee"], colSpan: 1 },
          { title: "Кофе", bgClass: C.tea_coffee, categoryIds: ["tea_coffee"], colSpan: 1 },
          { title: "Какао и горячий шоколад", bgClass: C.chocolate, categoryIds: ["tea_coffee"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Замороженные продукты",
      rows: [
        [
          { title: "Пельмени и вареники", bgClass: C.frozen, categoryIds: ["frozen"], colSpan: 1 },
          { title: "Замороженные овощи", bgClass: C.frozen, categoryIds: ["frozen"], colSpan: 1 },
          { title: "Мороженое", bgClass: C.frozen, categoryIds: ["frozen"], colSpan: 1 },
        ],
        [
          { title: "Полуфабрикаты", bgClass: C.frozen, categoryIds: ["frozen"], colSpan: 2 },
          { title: "Замороженные ягоды", bgClass: C.frozen, categoryIds: ["frozen"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Консервы и соусы",
      rows: [
        [
          { title: "Консервы мясные", bgClass: C.canned, categoryIds: ["canned"], colSpan: 1 },
          { title: "Консервы рыбные", bgClass: C.canned, categoryIds: ["canned"], colSpan: 1 },
          { title: "Консервы овощные", bgClass: C.canned, categoryIds: ["canned"], colSpan: 1 },
        ],
        [
          { title: "Кетчуп и горчица", bgClass: C.sauces, categoryIds: ["sauces"], colSpan: 1 },
          { title: "Майонез", bgClass: C.sauces, categoryIds: ["sauces"], colSpan: 1 },
          { title: "Соусы и заправки", bgClass: C.sauces, categoryIds: ["sauces"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Снеки и перекусы",
      rows: [
        [
          { title: "Чипсы и сухарики", bgClass: C.snacks, categoryIds: ["snacks"], colSpan: 1 },
          { title: "Орехи и сухофрукты", bgClass: C.snacks, categoryIds: ["snacks"], colSpan: 1 },
          { title: "Батончики и снеки", bgClass: C.snacks, categoryIds: ["snacks"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Бытовая химия",
      rows: [
        [
          { title: "Стиральный порошок и гели", bgClass: C.household, categoryIds: ["household"], colSpan: 2 },
          { title: "Средства для посуды", bgClass: C.household, categoryIds: ["household"], colSpan: 1 },
        ],
        [
          { title: "Чистящие средства", bgClass: C.household, categoryIds: ["household"], colSpan: 1 },
          { title: "Средства для уборки", bgClass: C.household, categoryIds: ["household"], colSpan: 1 },
          { title: "Губки, перчатки, пакеты", bgClass: C.household, categoryIds: ["household"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Для детей",
      rows: [
        [
          { title: "Детское питание", bgClass: C.baby, categoryIds: ["baby"], colSpan: 2 },
          { title: "Подгузники", bgClass: C.baby, categoryIds: ["baby"], colSpan: 1 },
        ],
        [
          { title: "Пюре и каши", bgClass: C.baby, categoryIds: ["baby"], colSpan: 1 },
          { title: "Детские соки", bgClass: C.baby, categoryIds: ["baby"], colSpan: 1 },
          { title: "Салфетки и уход", bgClass: C.baby, categoryIds: ["baby"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Для животных",
      rows: [
        [
          { title: "Корм для кошек", bgClass: C.pet, categoryIds: ["pet"], colSpan: 1 },
          { title: "Корм для собак", bgClass: C.pet, categoryIds: ["pet"], colSpan: 1 },
          { title: "Наполнители и уход", bgClass: C.pet, categoryIds: ["pet"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Алкоголь",
      rows: [
        [
          { title: "Вино", bgClass: C.alcohol, categoryIds: ["alcohol"], colSpan: 1 },
          { title: "Пиво", bgClass: C.alcohol, categoryIds: ["alcohol"], colSpan: 1 },
          { title: "Крепкий алкоголь", bgClass: C.alcohol, categoryIds: ["alcohol"], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  ПЕКАРНЯ У ДОМА (seller-2)  ═══════════════ */
  "seller-2": [
    {
      title: "Готовая еда",
      rows: [
        [
          { title: "Завтраки", bgClass: C.ready_food, categoryIds: ["ready_food", "soups", "second_courses"], colSpan: 1 },
          { title: "Супы", bgClass: C.soups, categoryIds: ["soups"], colSpan: 1 },
          { title: "Вторые блюда", bgClass: C.second_courses, categoryIds: ["second_courses"], colSpan: 1 },
        ],
        [
          { title: "Сэндвичи, выпечка, фаст-фуд", bgClass: C.bakery, categoryIds: ["bakery", "ready_food"], colSpan: 2 },
          { title: "Салаты, закуски, соусы", bgClass: C.salads, categoryIds: ["salads"], colSpan: 1 },
        ],
        [
          { title: "Пирожные и сладкая выпечка", bgClass: C.bakery, categoryIds: ["bakery"], colSpan: 1 },
          { title: "Напитки", bgClass: C.drinks, categoryIds: ["ready_food", "soups"], colSpan: 1 },
          { title: "Скидки", bgClass: C.discount, discountBadge: "−15%", categoryIds: ["ready_food", "bakery"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Выпечка и хлеб",
      rows: [
        [
          { title: "Хлеб свежий", bgClass: C.bakery, categoryIds: ["bakery"], colSpan: 2 },
          { title: "Булочки и круассаны", bgClass: C.bakery, categoryIds: ["bakery"], colSpan: 1 },
        ],
        [
          { title: "Пироги и пирожки", bgClass: C.bakery, categoryIds: ["bakery"], colSpan: 1 },
          { title: "Тесто и основы", bgClass: C.grocery, categoryIds: ["bakery", "groceries"], colSpan: 1 },
          { title: "К завтраку", bgClass: C.ready_food, categoryIds: ["bakery"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Сеты и комбо",
      rows: [
        [
          { title: "Обед из 3-х блюд", bgClass: C.combo, categoryIds: ["ready_food", "soups", "second_courses"], colSpan: 2 },
          { title: "Семейный ужин", bgClass: C.second_courses, categoryIds: ["ready_food", "second_courses", "salads"], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  ПЕШЕХОД (seller-3)  ═══════════════ */
  "seller-3": [
    {
      title: "Подборки сезона",
      rows: [
        [
          { title: "На весну", bgClass: C.spring, categoryIds: ["tshirts", "shoes"], colSpan: 1 },
          { title: "На лето", bgClass: C.summer, categoryIds: ["tshirts"], colSpan: 1 },
          { title: "Базовый гардероб", bgClass: C.basic, categoryIds: ["tshirts", "shoes"], colSpan: 1 },
        ],
        [
          { title: "Для активного отдыха", bgClass: C.sport, categoryIds: ["shoes", "tshirts"], colSpan: 2 },
          { title: "Новинки", bgClass: C.new_arrivals, categoryIds: ["tshirts", "shoes"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Обувь",
      rows: [
        [
          { title: "Кроссовки", bgClass: C.shoes, categoryIds: ["shoes_sneakers"], colSpan: 2 },
          { title: "Кеды и слипоны", bgClass: C.shoes, categoryIds: ["shoes_slipon"], colSpan: 1 },
        ],
        [
          { title: "Зимняя обувь", bgClass: C.shoes, categoryIds: ["shoes_winter"], colSpan: 1 },
          { title: "Летняя обувь", bgClass: C.shoes, categoryIds: ["shoes_summer"], colSpan: 1 },
          { title: "Скидки на обувь", bgClass: C.discount, discountBadge: "−14%", categoryIds: ["shoes_sale"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Футболки и верх",
      rows: [
        [
          { title: "Футболки", bgClass: C.tshirts, categoryIds: ["top_tshirt"], colSpan: 1 },
          { title: "Майки и топы", bgClass: C.tshirts, categoryIds: ["top_tank"], colSpan: 1 },
          { title: "Поло", bgClass: C.tshirts, categoryIds: ["top_polo"], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  СТРОЙИНСТРУМЕНТ (seller-4)  ═══════════════ */
  "seller-4": [
    {
      title: "Инструменты",
      rows: [
        [
          { title: "Молотки и кувалды", bgClass: C.hand_tools, categoryIds: ["hand", "tools"], colSpan: 1 },
          { title: "Отвёртки", bgClass: C.hand_tools, categoryIds: ["hand", "tools"], colSpan: 1 },
          { title: "Ключи", bgClass: C.hand_tools, categoryIds: ["hand", "tools"], colSpan: 1 },
        ],
        [
          { title: "Пилы и ножовки", bgClass: C.tools, categoryIds: ["hand", "tools"], colSpan: 2 },
          { title: "Измерительный", bgClass: C.tools, categoryIds: ["hand", "tools"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Расходники",
      rows: [
        [
          { title: "Крепёж и метизы", bgClass: C.tools, categoryIds: ["tools"], colSpan: 1 },
          { title: "Клеи и герметики", bgClass: C.tools, categoryIds: ["tools"], colSpan: 1 },
          { title: "Весь ассортимент", bgClass: C.all, categoryIds: [], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  МЕТИЗЫЧ (seller-9)  ═══════════════ */
  "seller-9": [
    {
      title: "Инструменты",
      rows: [
        [
          { title: "Отвёртки и биты", bgClass: C.hand_tools, categoryIds: ["hand_tools"], colSpan: 1 },
          { title: "Электроинструмент", bgClass: C.power_tools, categoryIds: ["power_tools"], colSpan: 1 },
          { title: "Наборы инструментов", bgClass: C.hand_tools, categoryIds: ["hand_tools", "tools"], colSpan: 1 },
        ],
        [
          { title: "Дрели и шуруповёрты", bgClass: C.power_tools, categoryIds: ["power_tools"], colSpan: 2 },
          { title: "Скидки", bgClass: C.discount, discountBadge: "−20%", categoryIds: ["tools", "power_tools"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Комплектующие для техники",
      rows: [
        [
          { title: "Для стиральных машин", bgClass: C.washing_machine, categoryIds: ["washing_machine", "components"], colSpan: 2 },
          { title: "Для холодильников", bgClass: C.fridge, categoryIds: ["fridge", "components"], colSpan: 1 },
        ],
        [
          { title: "Насосы и помпы", bgClass: C.components, categoryIds: ["components", "washing_machine"], colSpan: 1 },
          { title: "Терморегуляторы", bgClass: C.components, categoryIds: ["components", "fridge"], colSpan: 1 },
          { title: "Все запчасти", bgClass: C.all, categoryIds: ["components"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Крепёж и метизы",
      rows: [
        [
          { title: "Саморезы и шурупы", bgClass: C.tools, categoryIds: ["tools"], colSpan: 1 },
          { title: "Болты и гайки", bgClass: C.tools, categoryIds: ["tools"], colSpan: 1 },
          { title: "Анкеры и дюбели", bgClass: C.tools, categoryIds: ["tools"], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  ПЛАЗМА (seller-10)  ═══════════════ */
  "seller-10": [
    {
      title: "Техника и гаджеты",
      rows: [
        [
          { title: "Экшн-камеры", bgClass: C.gadgets, categoryIds: ["action_camera"], colSpan: 2 },
          { title: "Зарядки и кабели", bgClass: C.accessories, categoryIds: ["charging_cable"], colSpan: 1 },
        ],
        [
          { title: "Наушники", bgClass: C.gadgets, categoryIds: ["headphones"], colSpan: 1 },
          { title: "Power Bank", bgClass: C.accessories, categoryIds: ["power_bank"], colSpan: 1 },
          { title: "Выгодно", bgClass: C.discount, discountBadge: "−15%", categoryIds: ["electronics"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Часы",
      rows: [
        [
          { title: "Смарт-часы", bgClass: C.watches, categoryIds: ["digital_watch"], colSpan: 1 },
          { title: "Классические часы", bgClass: C.watches, categoryIds: ["classic_watch"], colSpan: 1 },
          {
            title: "Ремешки",
            bgClass: C.accessories,
            categoryIds: ["watches", "accessories"],
            categoryMatch: "all",
            colSpan: 1,
          },
        ],
      ],
    },
    {
      title: "Уход за собой",
      rows: [
        [
          { title: "Фены и стайлеры", bgClass: C.personal_care, categoryIds: ["hair_care"], colSpan: 2 },
          { title: "Электробритвы", bgClass: C.personal_care, categoryIds: ["electric_shaver"], colSpan: 1 },
        ],
        [
          { title: "Эпиляторы", bgClass: C.personal_care, categoryIds: ["epilator"], colSpan: 1 },
          { title: "Триммеры", bgClass: C.personal_care, categoryIds: ["trimmer"], colSpan: 1 },
          {
            title: "Все для ухода",
            bgClass: C.personal_care,
            categoryIds: ["hair_care", "electric_shaver", "epilator", "trimmer"],
            colSpan: 1,
          },
        ],
      ],
    },
  ],

  /* ═══════════════  TREND ZONE (seller-11)  ═══════════════ */
  "seller-11": [
    {
      title: "Подборки сезона",
      rows: [
        [
          { title: "На весну", bgClass: C.spring, categoryIds: ["outerwear"], colSpan: 1 },
          { title: "На лето", bgClass: C.summer, categoryIds: ["headwear", "accessories"], colSpan: 1 },
          { title: "Базовый гардероб", bgClass: C.basic, categoryIds: ["outerwear", "headwear", "accessories"], colSpan: 1 },
        ],
        [
          { title: "Тренды 2026", bgClass: C.trending, categoryIds: ["outerwear", "accessories"], colSpan: 2 },
          { title: "Новинки недели", bgClass: C.new_arrivals, categoryIds: ["outerwear", "headwear"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Верхняя одежда",
      rows: [
        [
          { title: "Куртки", bgClass: C.outerwear, categoryIds: ["coat_jacket"], colSpan: 1 },
          { title: "Ветровки", bgClass: C.outerwear, categoryIds: ["windbreaker"], colSpan: 1 },
          { title: "Пуховики", bgClass: C.outerwear, categoryIds: ["down_jacket"], colSpan: 1 },
        ],
        [
          { title: "Демисезонные куртки", bgClass: C.outerwear, categoryIds: ["jacket_demiseason"], colSpan: 2 },
          { title: "Скидки", bgClass: C.discount, discountBadge: "−17%", categoryIds: ["outerwear_sale"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Головные уборы",
      rows: [
        [
          { title: "Шапки вязаные", bgClass: C.headwear, categoryIds: ["hat_knit"], colSpan: 1 },
          { title: "Бейсболки", bgClass: C.headwear, categoryIds: ["cap_baseball"], colSpan: 1 },
          { title: "Панамы", bgClass: C.headwear, categoryIds: ["hat_panama"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Аксессуары",
      rows: [
        [
          { title: "Перчатки", bgClass: C.accessories, categoryIds: ["acc_gloves"], colSpan: 1 },
          { title: "Шарфы и платки", bgClass: C.accessories, categoryIds: ["acc_scarf"], colSpan: 1 },
          { title: "Сумки и рюкзаки", bgClass: C.accessories, categoryIds: ["acc_bag"], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  ROOBL (seller-12)  ═══════════════ */
  "seller-12": [
    {
      title: "Подборки",
      rows: [
        [
          { title: "На весну", bgClass: C.spring, categoryIds: ["outerwear"], colSpan: 1 },
          { title: "На лето", bgClass: C.summer, categoryIds: ["headwear"], colSpan: 1 },
          { title: "Базовый гардероб", bgClass: C.basic, categoryIds: ["outerwear", "headwear", "accessories"], colSpan: 1 },
        ],
        [
          { title: "Для спорта", bgClass: C.sport, categoryIds: ["outerwear", "accessories"], colSpan: 1 },
          { title: "Премиум-коллекция", bgClass: C.premium, categoryIds: ["outerwear", "accessories"], colSpan: 2 },
        ],
      ],
    },
    {
      title: "Худи и толстовки",
      rows: [
        [
          { title: "Худи классика", bgClass: C.outerwear, categoryIds: ["hoodie_pullover"], colSpan: 2 },
          { title: "Свитшоты", bgClass: C.outerwear, categoryIds: ["sweatshirt"], colSpan: 1 },
        ],
        [
          { title: "Оверсайз", bgClass: C.outerwear, categoryIds: ["hoodie_oversize"], colSpan: 1 },
          { title: "Зип-худи", bgClass: C.outerwear, categoryIds: ["hoodie_zip"], colSpan: 1 },
          { title: "До −15%", bgClass: C.discount, discountBadge: "−15%", categoryIds: ["pricedrop"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Кепки и головные уборы",
      rows: [
        [
          { title: "Кепки", bgClass: C.headwear, categoryIds: ["cap_black"], colSpan: 1 },
          { title: "Бейсболки", bgClass: C.headwear, categoryIds: ["cap_color"], colSpan: 1 },
          { title: "Панамы", bgClass: C.headwear, categoryIds: ["hat_panama"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Носки и аксессуары",
      rows: [
        [
          { title: "Носки чёрные", bgClass: C.accessories, categoryIds: ["socks_black"], colSpan: 1 },
          { title: "Носки белые", bgClass: C.accessories, categoryIds: ["socks_white"], colSpan: 1 },
          { title: "Ремни и мелочи", bgClass: C.accessories, categoryIds: ["acc_belt"], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  ЗЕЛЁНАЯ ЛАВКА (seller-13)  ═══════════════ */
  "seller-13": [
    {
      title: "Овощи, фрукты, грибы",
      rows: [
        [
          { title: "Овощи, зелень, грибы", bgClass: C.vegetables, categoryIds: ["vegetables", "greens"], colSpan: 1 },
          { title: "Фрукты и ягоды", bgClass: C.fruits, categoryIds: ["fruits"], colSpan: 1 },
          { title: "Сухофрукты и орехи", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 1 },
        ],
        [
          { title: "Помидоры и огурцы", bgClass: C.vegetables, categoryIds: ["vegetables"], colSpan: 1 },
          { title: "Зелень свежая", bgClass: C.greens, categoryIds: ["greens"], colSpan: 1 },
          { title: "Грибы", bgClass: C.vegetables, categoryIds: ["vegetables"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Бакалея",
      rows: [
        [
          { title: "Крупы и злаки", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 2 },
          { title: "Макароны", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 1 },
        ],
        [
          { title: "Мука и смеси", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 1 },
          { title: "Масло растительное", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 1 },
          { title: "Специи и приправы", bgClass: C.grocery, categoryIds: ["grocery"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Сезон на грядке",
      rows: [
        [
          { title: "Всё для салата", bgClass: C.salads, categoryIds: ["vegetables", "greens"], colSpan: 2 },
          { title: "Витамины свежести", bgClass: C.fruits, categoryIds: ["fruits", "greens"], colSpan: 1 },
        ],
      ],
    },
  ],

  /* ═══════════════  ДОМАШНИЙ ГАСТРОНОМ (seller-14)  ═══════════════ */
  "seller-14": [
    {
      title: "Деликатесы",
      rows: [
        [
          { title: "Мясные деликатесы", bgClass: C.deli, categoryIds: ["deli"], colSpan: 2 },
          { title: "Рыбные закуски", bgClass: C.deli, categoryIds: ["deli"], colSpan: 1 },
        ],
        [
          { title: "Сырная тарелка", bgClass: C.deli, categoryIds: ["deli"], colSpan: 1 },
          { title: "Оливки и маслины", bgClass: C.deli, categoryIds: ["deli"], colSpan: 1 },
          { title: "Паштеты и террины", bgClass: C.deli, categoryIds: ["deli"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Соусы и заправки",
      rows: [
        [
          { title: "Песто и заправки", bgClass: C.sauces, categoryIds: ["sauces"], colSpan: 1 },
          { title: "Кетчуп и горчица", bgClass: C.sauces, categoryIds: ["sauces"], colSpan: 1 },
          { title: "Соевый и азиатские", bgClass: C.sauces, categoryIds: ["sauces"], colSpan: 1 },
        ],
      ],
    },
    {
      title: "Для праздничного стола",
      rows: [
        [
          { title: "Сеты закусок", bgClass: C.combo, categoryIds: ["deli", "sauces"], colSpan: 2 },
          { title: "Подарочные наборы", bgClass: C.gift, categoryIds: ["deli", "sauces"], colSpan: 1 },
        ],
      ],
    },
  ],
};

export function getStaticStorefront(sellerId: string): StorefrontSectionDef[] | undefined {
  return STOREFRONT_SECTIONS[sellerId];
}
