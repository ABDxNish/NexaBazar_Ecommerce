export function normalizeBdPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+880')) return `0${cleaned.slice(4)}`;
  if (cleaned.startsWith('880')) return `0${cleaned.slice(3)}`;
  return cleaned;
}
