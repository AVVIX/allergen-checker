// Ingredientes/cereales que contienen gluten (ES + EN, formas más comunes en OFF).
export const GLUTEN_KEYWORDS = [
  "gluten",
  "trigo",
  "wheat",
  "cebada",
  "barley",
  "centeno",
  "rye",
  "malta",
  "malt",
  "espelta",
  "spelt",
  "kamut",
  "triticale",
  "avena",
  "oats",
  "sémola",
  "semolina",
  "cuscús",
  "couscous",
  "seitan",
  "bulgur",
];

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
