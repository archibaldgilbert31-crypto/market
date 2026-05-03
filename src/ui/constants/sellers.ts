/** Продавцы-рестораны: отдельный UI витрины (меню блюд), без карточек каталога «Азбука». */
export const RESTAURANT_SELLER_IDS = new Set(["seller-5", "seller-6", "seller-7", "seller-8"]);

export function isRestaurantSeller(sellerId: string): boolean {
  return RESTAURANT_SELLER_IDS.has(sellerId);
}
