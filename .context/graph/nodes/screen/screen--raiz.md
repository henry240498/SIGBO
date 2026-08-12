---
id: screen--raiz
tipo: SCREEN
nombre: /
nivel: L1
dominio: seguridad
resumen: Pantalla /, consume 1 endpoint(s).
ruta: /
capa: frontend
archivos:
  - frontend/src/app/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-publicaciones]
  - [calls, api--seguridad-apariencia]
---

# /

Pantalla /, consume 1 endpoint(s).

- **Ruta:** `/`

## Endpoints que consume

- `/seguridad/apariencia`

## Archivos

- `frontend/src/app/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-publicaciones|publicaciones]]
- `calls` → [[api--seguridad-apariencia|AparienciaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
