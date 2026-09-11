import type { OpenFoodFactsProductData } from "./gluten";

export interface OffLookupResult {
  found: boolean;
  name?: string;
  brand?: string;
  imageUrl?: string;
  data: OpenFoodFactsProductData;
}

interface OffApiResponse {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    image_front_small_url?: string;
    image_url?: string;
    ingredients_text?: string;
    ingredients_text_es?: string;
    allergens_tags?: string[];
    traces_tags?: string[];
    labels_tags?: string[];
  };
}

const FIELDS = [
  "product_name",
  "brands",
  "image_front_small_url",
  "image_url",
  "ingredients_text",
  "ingredients_text_es",
  "allergens_tags",
  "traces_tags",
  "labels_tags",
].join(",");

export async function lookupProductByBarcode(barcode: string): Promise<OffLookupResult> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    barcode
  )}.json?fields=${FIELDS}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "AVVIX-GlutenScanner/0.1 (contacto: avvix)",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts respondió con estado ${response.status}`);
  }

  const json = (await response.json()) as OffApiResponse;

  if (json.status !== 1 || !json.product) {
    return { found: false, data: {} };
  }

  const product = json.product;

  return {
    found: true,
    name: product.product_name,
    brand: product.brands,
    imageUrl: product.image_front_small_url ?? product.image_url,
    data: {
      ingredientsText: product.ingredients_text_es || product.ingredients_text,
      allergensTags: product.allergens_tags ?? [],
      tracesTags: product.traces_tags ?? [],
      labelsTags: product.labels_tags ?? [],
    },
  };
}
