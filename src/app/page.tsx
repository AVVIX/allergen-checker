import Link from "next/link";

const FEATURES = [
  { emoji: "📷", text: "Escanea el código de barras con la cámara" },
  { emoji: "🌾", text: "Sabe al instante si lleva gluten o trazas" },
  { emoji: "🥛", text: "Detecta lácteos, frutos secos, soja y más" },
  { emoji: "🤝", text: "Mejorado por la comunidad, no solo por datos" },
];

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-6 dark:from-neutral-950 dark:via-neutral-950 dark:to-black">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-10 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-3xl shadow-lg shadow-emerald-600/30">
            🌾
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              AVVIX
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Escanea un producto y sabe al instante si es apto para ti.
            </p>
          </div>
        </div>

        <Link
          href="/escanear"
          className="w-full rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          Empezar a escanear
        </Link>

        <ul className="flex w-full flex-col gap-3 text-left">
          {FEATURES.map((f) => (
            <li
              key={f.text}
              className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-sm text-neutral-700 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
            >
              <span className="text-lg">{f.emoji}</span>
              {f.text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 pb-6 text-xs text-neutral-400">
        Datos de producto vía Open Food Facts · Comunidad AVVIX
      </p>
    </main>
  );
}
