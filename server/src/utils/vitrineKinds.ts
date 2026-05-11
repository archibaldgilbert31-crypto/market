/** Витрины «рестораны / готовится к заказу» — склад и списание остатков не применяются. */

export const RESTAURANT_VITRINE_TYPES = new Set([
  "sushi",
  "ready_food",
  "pizza",
  "burgers",
  "georgian",
]);

export function isRestaurantVitrine(vitrineType: string): boolean {
  return RESTAURANT_VITRINE_TYPES.has(vitrineType);
}
