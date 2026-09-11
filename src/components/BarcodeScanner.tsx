"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  active: boolean;
}

export default function BarcodeScanner({ onDetected, active }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<Awaited<
    ReturnType<BrowserMultiFormatReader["decodeFromVideoDevice"]>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      controlsRef.current?.stop();
      return;
    }

    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, err) => {
        if (cancelled) return;
        if (result) {
          onDetected(result.getText());
        }
        if (err && err.name !== "NotFoundException") {
          // Errores de "no encontrado en este frame" son normales, se ignoran.
        }
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(
            "No se pudo acceder a la cámara. Comprueba los permisos del navegador."
          );
          console.error(err);
        }
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, onDetected]);

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-black aspect-[3/4]">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-emerald-400/80" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-sm text-white">
          {error}
        </div>
      )}
    </div>
  );
}
