# AVVIX — ¿Lleva gluten?

Escanea el código de barras de un producto y descubre al instante si contiene gluten,
trazas, o es apto para celíacos. PWA instalable (móvil y web), datos de
[Open Food Facts](https://openfoodfacts.org), caché propia en Turso.

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS
- Turso (libSQL) + Drizzle ORM como caché/base de datos propia
- Open Food Facts como fuente de datos de producto
- Escaneo de código de barras con la cámara vía `@zxing/browser`
- Vercel para despliegue

## Puesta en marcha

1. Crea una base de datos en [Turso](https://turso.tech) (gratis):
   ```bash
   turso db create avvix
   turso db show avvix --url
   turso db tokens create avvix
   ```
2. Copia `.env.example` a `.env.local` y rellena `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.
3. Instala dependencias y crea las tablas:
   ```bash
   npm install
   npm run db:push
   ```
4. Arranca en local (necesitas HTTPS o localhost para que el navegador permita la cámara):
   ```bash
   npm run dev
   ```
5. Abre `http://localhost:3000`, pulsa "Empezar a escanear" y da permiso de cámara.

## Despliegue en Vercel

1. Sube el repo a GitHub y conéctalo en Vercel.
2. Añade las variables de entorno `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` en el
   proyecto de Vercel.
3. Deploy. La PWA es instalable directamente desde el navegador (Android: "Añadir a
   pantalla de inicio"; iOS Safari: compartir → "Añadir a pantalla de inicio").

## Cómo funciona la clasificación de gluten

Ver [`src/lib/gluten.ts`](src/lib/gluten.ts): se cruzan los alérgenos, trazas,
etiquetas de certificación e ingredientes que devuelve Open Food Facts contra un
listado de cereales/palabras clave con gluten. Si el dato es dudoso o falta
información, se marca como "No lo sabemos todavía" en vez de arriesgar una
respuesta incorrecta.

Cualquier usuario puede reportar un error desde la pantalla de resultado; se guarda
en la tabla `reports` de Turso para revisión manual (fase 2: panel de moderación).

## Roadmap

- [x] MVP: escanear → Open Food Facts → clasificación → caché en Turso
- [ ] Panel de moderación para reportes de la comunidad
- [ ] Historial de escaneos por usuario (requiere cuentas)
- [ ] Otros alérgenos/dietas (lactosa, frutos secos, vegano)
- [ ] Iconos PWA definitivos con marca AVVIX
- [ ] Evaluar app nativa (React Native/Expo) si hay tracción
