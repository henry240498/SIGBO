---
id: dependency--nextjs
tipo: DEPENDENCY
nombre: Next.js 14 (App Router) + React 18
nivel: L1
resumen: "Frontend con Next.js 14.2 App Router y React 18.3. Solo tres dependencias de produccion: next, react y react-dom."
archivos:
  - frontend/package.json
terminos: [next, nextjs, react, app, router, frontend, cliente, tsx, dependencias, solo, tres, produccion, dom]
---

# Next.js 14 (App Router) + React 18

Frontend con Next.js 14.2 App Router y React 18.3. Solo tres dependencias de produccion: next, react y react-dom.

## Las tres dependencias, y eso es todo

```json
"next": "^14.2.18", "react": "^18.3.1", "react-dom": "^18.3.1"
```

No hay libreria de UI, ni de estado, ni de formularios, ni de fechas, ni cliente HTTP.
Todo se resuelve con `fetch`, `useState` y CSS propio. Ver
[[decision--sin-libreria-ui]] y [[rule--pantalla-cliente-sin-store]].

## Como se usa el App Router

- Rutas por carpetas en `frontend/src/app/`, con `page.tsx` y `layout.tsx`.
- **Todas** las paginas son `'use client'`. No se usan Server Components para datos,
  ni Server Actions, ni Route Handlers: el backend NestJS es la unica API.
- Alias `@/` apunta a `frontend/src/`.
<<<<<<< Updated upstream
- Segmentos dinamicos en uso: `[id]` (personal, usuarios, eventos, guardias, grupos) y
=======
- Segmentos dinamicos en uso: `[id]` (personal, usuarios, eventos, guardias) y
>>>>>>> Stashed changes
  `[modulo]` como comodin de dashboard.

## Consecuencia de no usar el servidor de Next

Next actua practicamente como servidor de archivos estaticos con enrutado. Eso
significa que:

- Las variables de entorno visibles al navegador necesitan el prefijo
  `NEXT_PUBLIC_` (`NEXT_PUBLIC_API_URL`).
- No hay forma de esconder un secreto en el frontend: todo lo que llega al cliente es
  publico. La autorizacion vive en el backend
  ([[rule--frontend-no-autoriza]]).
- El SEO y el render inicial no aprovechan SSR — irrelevante para un sistema interno
  detras de login, salvo la pantalla publica de publicaciones.


## Archivos

- `frontend/package.json`

---
<sub>Nodo **curado** (editable a mano).</sub>
