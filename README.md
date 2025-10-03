# Salarcon Tech Solutions – Frontend (Astro 5 + TailwindCSS 4)

Proyecto frontend construido con Astro 5 y TailwindCSS 4, con fuentes personalizadas, paleta de colores extendida y animaciones sutiles de entrada y revelado por scroll. Todo el diseño es responsive, mobile-first y accesible.

**Stack**
- Astro `^5.x`
- TailwindCSS `^4.x`
- Vite (por Astro)

**Características clave**
- Fuentes personalizadas: `Work Sans` (primaria) y `Geist Mono` (secundaria) integradas en `src/styles/global.css`.
- Paleta extendida con `green-500`, `salmon-500`, `blue-500`, `dark-500`, `white-500`.
- Animaciones utilitarias: `animate-in`, `anim-up`, `anim-down`, `anim-zoom`, delays `delay-75..600`.
- Sistema de reveal-on-scroll con `IntersectionObserver`: usa `[data-reveal]` + utilidades de animación.
- Accesibilidad: respeta `prefers-reduced-motion` (sin animaciones si el usuario lo prefiere). 
- SEO básico: `lang="es"`, `<title>` por props del layout y `<meta name="description">`.

## Estructura del proyecto

```text
/
├── public/
│   ├── favicon.svg
│   ├── fonts/
│   │   ├── GeistMono-Regular.ttf
│   │   └── WorkSans-Regular.ttf
│   └── logo/
│       ├── icon_Favicon.png
│       ├── img-home.png
│       ├── logo-h-transp.png
│       └── logo-h-transp2.png
├── src/
│   ├── components/
│   │   ├── navbar.astro
│   │   ├── hero.astro
│   │   ├── services.astro
│   │   ├── portfolio.astro
│   │   ├── contact.astro
│   │   └── copyright.astro
│   ├── layouts/
│   │   └── main.layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── package.json
└── astro.config.mjs
```

## Estilos y fuentes

- TailwindCSS 4 se importa en `global.css` con `@import "tailwindcss"` y la paleta se define con `@theme`.
- Fuentes:
  - `.work-sans` aplica `Work Sans`.
  - `.geist-mono` aplica `Geist Mono`.
- Usa la paleta extendida en clases utilitarias (ej. `text-salmon-500`, `bg-dark-500`).

## Animaciones

- Entrada sutil en carga inicial:
  - `animate-in` + uno de: `anim-up`, `anim-down`, `anim-zoom`.
  - Delays para cascada: `delay-75`, `delay-150`, `delay-225`, `delay-300`, `delay-375`, `delay-450`, `delay-600`.
- Reveal-on-scroll:
  - Añade el atributo `data-reveal` al elemento que quieras revelar.
  - Las animaciones con `animate-in` quedan pausadas por defecto en `[data-reveal]` y se activan al añadir `.revealed`.
  - El script global en `main.layout.astro` observa `[data-reveal]` y añade `.revealed` al entrar en viewport.

Ejemplo:

```astro
<div data-reveal class="animate-in anim-up delay-225">
  <!-- Contenido a revelar -->
</div>
```

Accesibilidad:
- `@media (prefers-reduced-motion: reduce)` desactiva transformaciones y animaciones.
- Fallback si `IntersectionObserver` no está disponible: los elementos se muestran (
  se añade `.revealed`).

## Componentes principales

- `Navbar`: navegación superior con animaciones sutiles.
- `Hero`: cabecera con título, descripción, CTA e imagen con decoraciones.
- `Services`: bloque de servicios con entradas suaves y escalonadas.
- `Portfolio`: historia/evolución con tarjetas y efectos sutiles.
- `Contact`: formulario y tarjetas de contacto con cascada de revelado.
- `Copyright`: footer siempre visible (animación de entrada sutil en carga).

## Scripts de desarrollo

- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev` (abre `http://localhost:4321`)
- Build: `npm run build`
- Preview del build: `npm run preview`

## Buenas prácticas

- Semántico y accesible: usa etiquetas correctas (`section`, `header`, `footer`).
- Mobile-first: empieza estilos desde `sm` hacia arriba.
- Evita valores hex manuales; usa la paleta extendida.
- Reutiliza las utilidades de animación y delays para mantener consistencia.

## Personalización rápida

- Cambia delays (`delay-150`, `delay-225`, etc.) para ajustar el ritmo.
- Sustituye `anim-up/anim-down/anim-zoom` según el carácter del bloque.
- Para elementos que deben estar siempre visibles, evita `data-reveal` y usa sólo `animate-in`.

## Entorno

- Copia `.env.example` a `.env` y rellena los valores requeridos.
- `.env` está ignorado por Git para evitar subir credenciales.
- Variables usadas por el endpoint de contacto (SMTP):
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
  - `CONTACT_TO`, `SMTP_FROM`, `SMTP_FROM_NAME`
  - `SMTP_AUTH_METHOD` (LOGIN, PLAIN, etc.)
  - `SMTP_TLS_REJECT_UNAUTHORIZED` (true/false)
  - `SMTP_FAMILY` (4 o 6)

## Build y Deploy

- Desarrollo: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Adaptador: `@astrojs/cloudflare` para funciones/SSR (requerido por `src/pages/api/contact.ts`).

### Cloudflare Pages
- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Node Version: `20`
- Pages Functions habilitadas.
- Variables de entorno: configurar las anteriores en Pages > Settings > Environment Variables.

Nota: Cloudflare Workers no soporta conexiones SMTP directas. Para producción, considera usar un proveedor con API HTTP (Resend, SendGrid, Mailgun) en lugar de `nodemailer`.

## Seguridad

- `.gitignore` bloquea `.env`, `.wrangler/` y archivos de claves (`*.pem`, `*.key`, `*.crt`).
- El endpoint de contacto incluye validación/sanitización de inputs y limita logs sensibles.
- No exponer credenciales en logs, commits o en el cliente.
- Recomendada protección anti‑spam con Cloudflare Turnstile en el formulario.
- Rotar contraseñas SMTP y usar cuentas de servicio.
