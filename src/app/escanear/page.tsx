"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ResultCard, { type ProductResult } from "@/components/ResultCard";

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
  const lastCodeRef = useRef<string | null>(null);

  const lookup = useCallback(async (barcode: string) => {
    if (lastCodeRef.current === barcode && view.status !== "scanning") return;
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

      setView({ status: "result", result: data as ProductResult });
    } catch {
      setView({
        status: "error",
        message: "Error de conexión. Comprueba tu internet e inténtalo de nuevo.",
      });
    }
  }, [view.status]);

  function resetToScanning() {
    lastCodeRef.current = null;
    setView({ status: "scanning" });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 px-4 py-8">
      <header className="text-center">
        <h1 className="text-xl font-bold tracking-tight">AVVIX</h1>
        <p className="text-sm text-neutral-500">Escanea y descubre si lleva gluten</p>
      </header>

      {view.status === "scanning" && (
        <>
          <BarcodeScanner active onDetected={lookup} />
          <ManualEntry
            value={manualCode}
            onChange={setManualCode}
            onSubmit={() => manualCode.trim() && lookup(manualCode.trim())}
          />
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
        className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm dark:border-white/10 dark:bg-neutral-800"
      />
      <button
        type="submit"
        className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/10"
      >
        Buscar
      </button>
    </form>
  );
}
