export function parseAndClampSize(value: string, field: 'w' | 'h'): number {
  const raw = value?.trim();
  const min = field === 'w' ? 80 : 60;
  if (!raw) return min;
  const n = Number(raw);
  if (!Number.isFinite(n) || isNaN(n)) return min;
  return Math.max(min, Math.floor(n));
}
