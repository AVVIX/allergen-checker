"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ResultCard, { type ProductResult } from "@/components/ResultCard";
import { STATUS_CONFIG } from "@/lib/statusConfig";
import { addToHistory, getHistory, type HistoryEntry } from "@/lib/history";
import type { GlutenStatus } from "@/lib/gluten";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), {
  ssr: false,
});

type ViewState =
  | { status: "scanning" }
  | { status: "loading"; barcode: string }
  | { status: "result"; result: ProductResult }
  | { status: "error"; message: string };

export default function EscanearPage() {
  const [view, setView] = useState<ViewState>({ status: "scanning" });
  const [manualCode, setManualCode] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const lastCodeRef = useRef<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const lookup = useCallback(async (barcode: string) => {
    lastCodeRef.current = barcode;
    setView({ status: "loading", barcode });

    try {
      const res = await fetch(`/api/product/${encodeURIComponent(barcode)}`);
      const data = await res.json();

      if (!res.ok) {
        setView({
          status: "error",
          message:
            data.error ??
            "No hemos encontrado este producto todavía. Prueba a fotografiarlo o buscarlo manualmente.",
        });
        return;
      }

      const result = data as ProductResult;
      setView({ status: "result", result });
      addToHistory({
        barcode: result.barcode,
        name: result.name,
        imageUrl: result.imageUrl,
        glutenStatus: result.glutenStatus,
        scannedAt: Date.now(),
      });
      setHistory(getHistory());
    } catch {
      setView({
        status: "error",
        message: "Error de conexión. Comprueba tu internet e inténtalo de nuevo.",
      });
    }
  }, []);

  function resetToScanning() {
    lastCodeRef.current = null;
    setView({ status: "scanning" });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <header className="flex w-full items-center justify-between">
        <Link href="/" className="text-sm text-neutral-400">
          ← AVVIX
        </Link>
        <p className="text-sm font-medium text-neutral-500">Escanea y descubre</p>
      </header>

      {view.status === "scanning" && (
        <>
          <BarcodeScanner active onDetected={lookup} />
          <ManualEntry
            value={manualCode}
            onChange={setManualCode}
            onSubmit={() => manualCode.trim() && lookup(manualCode.trim())}
          />

          {history.length > 0 && (
            <div className="w-full max-w-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Escaneados recientemente
              </p>
              <ul className="flex flex-col gap-2">
                {history.map((entry) => (
                  <li key={entry.barcode}>
                    <button
                      onClick={() => lookup(entry.barcode)}
                      className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-white px-3 py-2 text-left text-sm shadow-sm dark:border-white/10 dark:bg-neutral-900"
                    >
                      {entry.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.imageUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                      )}
                      <span className="flex-1 truncate text-neutral-700 dark:text-neutral-300">
                        {entry.name ?? entry.barcode}
                      </span>
                      <span className="text-base">
                        {STATUS_CONFIG[entry.glutenStatus as GlutenStatus]?.emoji}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {view.status === "loading" && (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-neutral-500">Consultando {view.barcode}…</p>
        </div>
      )}

      {view.status === "result" && (
        <ResultCard result={view.result} onScanAgain={resetToScanning} />
      )}

      {view.status === "error" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{view.message}</p>
          <button
            onClick={resetToScanning}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Volver a intentar
          </button>
        </div>
      )}
    </main>
  );
}

function ManualEntry({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex w-full max-w-sm gap-2"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        placeholder="O escribe el código de barras"
        className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-neutral-900"
      />
      <button
        type="submit"
        className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-neutral-900"
      >
        Buscar
      </button>
    </form>
  );
}
