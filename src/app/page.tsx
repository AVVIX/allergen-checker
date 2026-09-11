import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-emerald-50 px-6 text-center dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl">🌾🚫</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          AVVIX
        </h1>
        <p className="max-w-xs text-neutral-600 dark:text-neutral-400">
          Escanea el código de barras de cualquier producto y sabe al instante si
          tiene gluten, trazas o es apto para celíacos.
        </p>
      </div>

      <Link
        href="/escanear"
        className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        Empezar a escanear
      </Link>

      <p className="text-xs text-neutral-400">
        Datos de producto vía Open Food Facts · Comunidad AVVIX
      </p>
    </main>
  );
}
