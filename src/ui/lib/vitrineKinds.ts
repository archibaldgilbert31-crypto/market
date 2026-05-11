/** Синхронизируйте с server/src/utils/vitrineKinds.ts */

const RESTAURANT_VITRINE_TYPES = new Set([
  "sushi",
  "ready_food",
  "pizza",
  "burgers",
  "georgian",
]);

export function isRestaurantVitrine(vitrineType: string | undefined): boolean {
  if (!vitrineType) return false;
  return RESTAURANT_VITRINE_TYPES.has(vitrineType);
}
