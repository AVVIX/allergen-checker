import type { OpenFoodFactsProductData } from "./gluten";
import { GLUTEN_KEYWORDS, normalize } from "./textMatch";

export type AllergenStatus = "contains" | "traces" | "free" | "unknown";

export interface AllergenDefinition {
  key: string;
  label: string;
  emoji: string;
  offTag: string;
}

export const ALLERGENS: AllergenDefinition[] = [
  { key: "gluten", label: "Gluten", emoji: "🌾", offTag: "gluten" },
  { key: "milk", label: "Lácteos", emoji: "🥛", offTag: "milk" },
  { key: "eggs", label: "Huevo", emoji: "🥚", offTag: "eggs" },
  { key: "peanuts", label: "Cacahuete", emoji: "🥜", offTag: "peanuts" },
  { key: "nuts", label: "Frutos secos", emoji: "🌰", offTag: "nuts" },
  { key: "soybeans", label: "Soja", emoji: "🌱", offTag: "soybeans" },
  { key: "fish", label: "Pescado", emoji: "🐟", offTag: "fish" },
  { key: "crustaceans", label: "Crustáceos", emoji: "🦐", offTag: "crustaceans" },
  { key: "molluscs", label: "Moluscos", emoji: "🐚", offTag: "molluscs" },
  { key: "celery", label: "Apio", emoji: "🥬", offTag: "celery" },
  { key: "mustard", label: "Mostaza", emoji: "🌭", offTag: "mustard" },
  { key: "sesame-seeds", label: "Sésamo", emoji: "🫘", offTag: "sesame-seeds" },
  { key: "sulphur-dioxide-and-sulphites", label: "Sulfitos", emoji: "🍷", offTag: "sulphur-dioxide-and-sulphites" },
  { key: "lupin", label: "Altramuces", emoji: "🌼", offTag: "lupin" },
];

export interface AllergenResult {
  key: string;
  label: string;
  emoji: string;
  status: AllergenStatus;
}

function hasTag(tags: string[], offTag: string): boolean {
  const needle = normalize(offTag);
  return tags.some((tag) => normalize(tag).includes(needle));
}

export function classifyAllergens(data: OpenFoodFactsProductData): AllergenResult[] {
  const allergensTags = data.allergensTags ?? [];
  const tracesTags = data.tracesTags ?? [];
  const ingredients = normalize(data.ingredientsText ?? "");
  const hasBaseData = Boolean(data.ingredientsText || allergensTags.length);

  return ALLERGENS.map((allergen) => {
    if (hasTag(allergensTags, allergen.offTag)) {
      return { ...allergen, status: "contains" as const };
    }

    if (allergen.key === "gluten" && GLUTEN_KEYWORDS.some((kw) => ingredients.includes(normalize(kw)))) {
      return { ...allergen, status: "contains" as const };
    }

    if (hasTag(tracesTags, allergen.offTag)) {
      return { ...allergen, status: "traces" as const };
    }

    if (hasBaseData) {
      return { ...allergen, status: "free" as const };
    }

    return { ...allergen, status: "unknown" as const };
  });
}
