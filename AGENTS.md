# AGENTS.md

Guía de directrices, estándares y restricciones para agentes de IA que operen en este repositorio.

---

## 1. Visión General del Proyecto

- **Nombre:** Salarcon Tech Solutions (Frontend & API)
- **Framework:** Astro 5 (`^5.x`) con modo híbrido (`output: "static"` con rutas API SSR seleccionadas via `export const prerender = false;`).
- **Adaptador:** `@astrojs/cloudflare` para despliegue en Cloudflare Pages / Workers.
- **Estilos:** TailwindCSS 4 (`@tailwindcss/vite` + `@import "tailwindcss"` en CSS).
- **Entorno de ejecución en producción:** Cloudflare Pages Functions (V8 runtime / workerd).

---

## 2. Gestor de Paquetes y Herramientas (ESTRICTO: pnpm)

- **Gestor único obligatorio:** **`pnpm`** (versión `11.x` o superior).
- **Prohibido:** NUNCA ejecutes `npm`, `npx` ni `yarn`. NUNCA generes ni commitees `package-lock.json` o `yarn.lock`.
- **Comandos estándar:**
  - Instalar dependencias: `pnpm install`
  - Agregar dependencias: `pnpm add <paquete>` (o `pnpm add -D <paquete>`)
  - Servidor de desarrollo: `pnpm dev`
  - Compilación: `pnpm build`
  - Vista previa: `pnpm preview`
  - Diagnóstico Astro: `pnpm astro check`
- **Configuración de pnpm:**
  - La directiva `allowBuilds` para binarios nativos (`@tailwindcss/oxide`, `esbuild`, `sharp`, `workerd`) se gestiona en [`pnpm-workspace.yaml`](file:///c:/Development/Astro/salarcon_tech_solutions/pnpm-workspace.yaml). No agregues bloques `"pnpm"` dentro de `package.json`.

---

## 3. Estructura y Componentes Clave

```text
/
├── public/                 # Assets estáticos (fuentes TTF, logos, favicon)
├── src/
│   ├── components/         # Componentes modulares Astro (.astro)
│   ├── layouts/            # Layouts principales (main.layout.astro)
│   ├── pages/              # Páginas y rutas de la aplicación
│   │   ├── api/            # Endpoints SSR (contact.ts)
│   │   └── index.astro     # Landing principal
│   └── styles/
│       └── global.css      # Definición de Tailwind v4 (@theme, tipografías, animaciones)
├── .vscode/settings.json   # Configuración de editor ("npm.packageManager": "pnpm")
├── pnpm-workspace.yaml     # Configuración de allowBuilds de pnpm 11+
├── pnpm-lock.yaml          # Lockfile de dependencias del proyecto
├── package.json
└── astro.config.mjs        # Configuración de Astro, Cloudflare y Tailwind
```

---

## 4. Convenciones de Código y Estilos

### Astro y TypeScript
- Usa TypeScript estricto. Mantén compatibilidad con `tsconfig.json`.
- En componentes `.astro`, separa claramente el frontmatter (`---`) de la plantilla HTML.
- Componentes modulares, reutilizables y con accesibilidad semántica (`<header>`, `<main>`, `<section>`, `<footer>`).

### TailwindCSS 4
- Tailwind 4 no utiliza `tailwind.config.js`. La configuración y paleta personalizada se define en [`src/styles/global.css`](file:///c:/Development/Astro/salarcon_tech_solutions/src/styles/global.css) usando `@theme`.
- Paleta extendida del proyecto: `green-500`, `salmon-500`, `blue-500`, `dark-500`, `white-500`.
- Tipografías: `Work Sans` (clase `.work-sans`) y `Geist Mono` (clase `.geist-mono`).
- Mobile-first: aplica diseño responsivo progresivo (`sm:`, `md:`, `lg:`).

### Animaciones y Accesibilidad
- Animaciones de revelado por scroll: usa el atributo `data-reveal` junto a clases utilitarias (`animate-in`, `anim-up`, `delay-150`, etc.).
- Respeta siempre la preferencia de movimiento reducido: `@media (prefers-reduced-motion: reduce)`.

---

## 5. Endpoints de API y Limitaciones de Cloudflare

- **Rutas SSR:** Cualquier endpoint en `src/pages/api/` debe exportar `export const prerender = false;`.
- **Restricción de runtime:** Cloudflare Pages Functions corre en el runtime `workerd` (V8), **no** soporta sockets TCP directos para librerías como `nodemailer` en producción.
- **Envío de correos:** El endpoint de contacto utiliza la **API HTTP de Resend**.
  - Variables requeridas: `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO`.
  - Sanitiza y valida siempre las entradas del usuario (validación de correo, bloqueo de inyecciones y caracteres de control).

---

## 6. Seguridad y Archivos Protegidos

- **Prohibido modificar o versionar:**
  - `.env`, `.env.*` (las credenciales y tokens nunca se commitean).
  - `.wrangler/`, `.astro/`, `dist/`, `.pnpm-store/`, `node_modules/`.
  - Claves criptográficas o certificados (`*.pem`, `*.key`, `*.crt`).
- Nunca expongas secretos ni claves de API en el cliente (`client:only`, scripts embebidos en el DOM o respuestas públicas de endpoints).

---

## 7. Flujo de Trabajo y Verificación

Antes de dar por completada cualquier tarea que modifique código o dependencias:
1. Asegúrate de compilar el proyecto con `pnpm build` sin errores.
2. Si agregas dependencias nuevas, hazlo con `pnpm add <pkg>` y verifica que no queden scripts bloqueados por `pnpm`.
3. Mantén mensajes de Git siguiendo la convención de **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).

