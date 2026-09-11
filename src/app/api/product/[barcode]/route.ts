import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { lookupProductByBarcode } from "@/lib/openfoodfacts";
import { classifyGluten } from "@/lib/gluten";

const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await params;

  if (!/^[0-9]{6,14}$/.test(barcode)) {
    return NextResponse.json({ error: "Código de barras no válido." }, { status: 400 });
  }

  const db = getDb();

  const cached = await db.query.products.findFirst({
    where: eq(products.barcode, barcode),
  });

  if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_MAX_AGE_MS) {
    return NextResponse.json(toResponse(cached));
  }

  try {
    const lookup = await lookupProductByBarcode(barcode);

    if (!lookup.found) {
      if (cached) return NextResponse.json(toResponse(cached));
      return NextResponse.json(
        { error: "Producto no encontrado en Open Food Facts.", barcode },
        { status: 404 }
      );
    }

    const classification = classifyGluten(lookup.data);
    const now = new Date();

    const row = {
      barcode,
      name: lookup.name ?? null,
      brand: lookup.brand ?? null,
      imageUrl: lookup.imageUrl ?? null,
      ingredientsText: lookup.data.ingredientsText ?? null,
      allergensTags: JSON.stringify(lookup.data.allergensTags ?? []),
      tracesTags: JSON.stringify(lookup.data.tracesTags ?? []),
      glutenStatus: classification.status,
      glutenReason: classification.reason,
      source: "openfoodfacts",
      updatedAt: now,
    };

    await db
      .insert(products)
      .values(row)
      .onConflictDoUpdate({ target: products.barcode, set: row });

    return NextResponse.json(toResponse(row));
  } catch (error) {
    if (cached) return NextResponse.json(toResponse(cached));
    console.error("Error consultando Open Food Facts", error);
    return NextResponse.json(
      { error: "No se pudo consultar la información del producto." },
      { status: 502 }
    );
  }
}

function toResponse(row: {
  barcode: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  glutenStatus: string;
  glutenReason: string | null;
}) {
  return {
    barcode: row.barcode,
    name: row.name,
    brand: row.brand,
    imageUrl: row.imageUrl,
    glutenStatus: row.glutenStatus,
    glutenReason: row.glutenReason,
  };
}
