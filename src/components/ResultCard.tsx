"use client";

import { useState } from "react";
import { STATUS_CONFIG } from "@/lib/statusConfig";
import type { GlutenStatus } from "@/lib/gluten";
import type { AllergenResult } from "@/lib/allergens";

export interface ProductResult {
  barcode: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  glutenStatus: GlutenStatus;
  glutenReason: string | null;
  allergens: AllergenResult[];
}

const ALLERGEN_STYLES: Record<AllergenResult["status"], string> = {
  contains: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  traces: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  free: "bg-neutral-50 text-neutral-400 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:border-neutral-800",
  unknown: "bg-neutral-50 text-neutral-400 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:border-neutral-800",
};

export default function ResultCard({
  result,
  onScanAgain,
}: {
  result: ProductResult;
  onScanAgain: () => void;
}) {
  const config = STATUS_CONFIG[result.glutenStatus];
  const [reportSent, setReportSent] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [showAllAllergens, setShowAllAllergens] = useState(false);
  const [message, setMessage] = useState("");

  const otherAllergens = result.allergens.filter((a) => a.key !== "gluten");
  const relevantAllergens = otherAllergens.filter((a) => a.status === "contains" || a.status === "traces");
  const allergensToShow = showAllAllergens ? otherAllergens : relevantAllergens;

  async function sendReport() {
    if (!message.trim()) return;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode: result.barcode, message }),
    });
    setReportSent(true);
  }

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-black/5 bg-white shadow-lg shadow-black/5 dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-center gap-3 border-b border-black/5 p-5 dark:border-white/5">
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.imageUrl}
            alt={result.name ?? "Producto"}
            className="h-16 w-16 rounded-xl object-cover ring-1 ring-black/5"
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-neutral-900 dark:text-white">
            {result.name ?? "Producto sin nombre"}
          </p>
          <p className="truncate text-sm text-neutral-500">{result.brand ?? "Marca desconocida"}</p>
          <p className="text-xs text-neutral-400">{result.barcode}</p>
        </div>
      </div>

      <div className="p-5 pt-4">
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${config.className}`}
        >
          <span className="text-xl leading-none">{config.emoji}</span>
          <div>
            <p>{config.label}</p>
            {result.glutenReason && (
              <p className="mt-0.5 text-xs font-normal opacity-80">{result.glutenReason}</p>
            )}
          </div>
        </div>

        {allergensToShow.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Otros alérgenos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allergensToShow.map((a) => (
                <span
                  key={a.key}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${ALLERGEN_STYLES[a.status]}`}
                >
                  <span>{a.emoji}</span>
                  {a.label}
                  {a.status === "traces" && <span className="opacity-70">(trazas)</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {otherAllergens.length > relevantAllergens.length && (
          <button
            onClick={() => setShowAllAllergens((v) => !v)}
            className="mt-3 text-xs text-neutral-400 underline"
          >
            {showAllAllergens ? "Ocultar el resto" : "Ver todos los alérgenos analizados"}
          </button>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={onScanAgain}
            className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Escanear otro producto
          </button>

          {!reportOpen && !reportSent && (
            <button
              onClick={() => setReportOpen(true)}
              className="text-xs text-neutral-400 underline"
            >
              ¿Este dato no es correcto? Avísanos
            </button>
          )}

          {reportOpen && !reportSent && (
            <div className="flex flex-col gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos qué está mal (ej: sí lleva gluten, marca la fábrica en el envase)"
                className="rounded-xl border border-black/10 p-2 text-xs dark:border-white/10 dark:bg-neutral-800"
                rows={3}
              />
              <button
                onClick={sendReport}
                className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-medium dark:border-white/10"
              >
                Enviar corrección
              </button>
            </div>
          )}

          {reportSent && (
            <p className="text-xs text-emerald-600">¡Gracias! Revisaremos el producto.</p>
          )}
        </div>
      </div>
    </div>
  );
}
