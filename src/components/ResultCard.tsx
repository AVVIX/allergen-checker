"use client";

import { useState } from "react";
import { STATUS_CONFIG } from "@/lib/statusConfig";
import type { GlutenStatus } from "@/lib/gluten";

export interface ProductResult {
  barcode: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  glutenStatus: GlutenStatus;
  glutenReason: string | null;
}

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
  const [message, setMessage] = useState("");

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
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:bg-neutral-900 dark:border-white/10">
      <div className="flex items-center gap-3">
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.imageUrl}
            alt={result.name ?? "Producto"}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{result.name ?? "Producto sin nombre"}</p>
          <p className="truncate text-sm text-neutral-500">{result.brand ?? "Marca desconocida"}</p>
          <p className="text-xs text-neutral-400">{result.barcode}</p>
        </div>
      </div>

      <div
        className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${config.className}`}
      >
        <span className="mr-2">{config.emoji}</span>
        {config.label}
        {result.glutenReason && (
          <p className="mt-1 text-xs font-normal opacity-80">{result.glutenReason}</p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={onScanAgain}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Escanear otro producto
        </button>

        {!reportOpen && !reportSent && (
          <button
            onClick={() => setReportOpen(true)}
            className="text-xs text-neutral-500 underline"
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
              className="rounded-lg border border-black/10 p-2 text-xs dark:border-white/10 dark:bg-neutral-800"
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
  );
}
