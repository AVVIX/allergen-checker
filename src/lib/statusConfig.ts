import type { GlutenStatus } from "./gluten";

export const STATUS_CONFIG: Record<
  GlutenStatus,
  { label: string; className: string; emoji: string }
> = {
  gluten_free: {
    label: "Sin gluten",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    emoji: "✅",
  },
  contains_gluten: {
    label: "Contiene gluten",
    className: "bg-red-100 text-red-800 border-red-300",
    emoji: "⛔",
  },
  may_contain_traces: {
    label: "Puede contener trazas",
    className: "bg-amber-100 text-amber-800 border-amber-300",
    emoji: "⚠️",
  },
  unknown: {
    label: "No lo sabemos todavía",
    className: "bg-gray-100 text-gray-700 border-gray-300",
    emoji: "❔",
  },
};
