const KEY = "avvix.scanHistory";
const MAX_ITEMS = 10;

export interface HistoryEntry {
  barcode: string;
  name: string | null;
  imageUrl: string | null;
  glutenStatus: string;
  scannedAt: number;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  try {
    const current = getHistory().filter((e) => e.barcode !== entry.barcode);
    const next = [entry, ...current].slice(0, MAX_ITEMS);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage no disponible (modo privado, etc.) — no es crítico.
  }
}
