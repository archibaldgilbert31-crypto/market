/** Нормализует российский номер к виду 79XXXXXXXXX (11 цифр). */
export function normalizeRussianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return "7" + digits.slice(1);
  if (digits.length === 11 && digits.startsWith("7")) return digits;
  if (digits.length === 10 && digits.startsWith("9")) return "7" + digits;
  return null;
}
