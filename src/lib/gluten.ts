export type GlutenStatus =
  | "gluten_free"
  | "contains_gluten"
  | "may_contain_traces"
  | "unknown";

export interface GlutenClassification {
  status: GlutenStatus;
  reason: string;
}

// Ingredientes/cereales que contienen gluten (ES + EN, formas más comunes en OFF).
const GLUTEN_KEYWORDS = [
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
  "avena", // avena solo es problemática si no es certificada sin gluten; se marca como traza si no hay certificación explícita
  "oats",
  "sémola",
  "semolina",
  "cuscús",
  "couscous",
  "seitan",
  "bulgur",
];

const GLUTEN_FREE_CERTIFIED_TAGS = [
  "en:gluten-free",
  "es:sin-gluten",
  "en:no-gluten",
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export interface OpenFoodFactsProductData {
  ingredientsText?: string | null;
  allergensTags?: string[];
  tracesTags?: string[];
  labelsTags?: string[];
}

export function classifyGluten(data: OpenFoodFactsProductData): GlutenClassification {
  const allergens = (data.allergensTags ?? []).map(normalize);
  const traces = (data.tracesTags ?? []).map(normalize);
  const labels = (data.labelsTags ?? []).map(normalize);
  const ingredients = normalize(data.ingredientsText ?? "");

  const isCertifiedGlutenFree = labels.some((label) =>
    GLUTEN_FREE_CERTIFIED_TAGS.some((tag) => label.includes(normalize(tag)))
  );

  const allergensMentionGluten = allergens.some((a) => a.includes("gluten"));
  const tracesMentionGluten = traces.some((t) => t.includes("gluten"));

  const ingredientsMentionGluten = GLUTEN_KEYWORDS.some((keyword) =>
    ingredients.includes(normalize(keyword))
  );

  if (isCertifiedGlutenFree && !allergensMentionGluten) {
    return {
      status: "gluten_free",
      reason: "El producto está etiquetado/certificado como sin gluten.",
    };
  }

  if (allergensMentionGluten) {
    return {
      status: "contains_gluten",
      reason: "El listado de alérgenos de Open Food Facts indica gluten.",
    };
  }

  if (ingredientsMentionGluten && !isCertifiedGlutenFree) {
    return {
      status: "contains_gluten",
      reason: "Los ingredientes mencionan trigo, cebada, centeno u otro cereal con gluten.",
    };
  }

  if (tracesMentionGluten) {
    return {
      status: "may_contain_traces",
      reason: "El fabricante advierte de posibles trazas de gluten.",
    };
  }

  if (data.ingredientsText || data.allergensTags?.length) {
    return {
      status: "gluten_free",
      reason:
        "No se han encontrado ingredientes, alérgenos ni trazas de gluten en los datos disponibles.",
    };
  }

  return {
    status: "unknown",
    reason: "No hay suficiente información del producto para determinar si contiene gluten.",
  };
}
