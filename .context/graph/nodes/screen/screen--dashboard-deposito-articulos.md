---
id: screen--dashboard-deposito-articulos
tipo: SCREEN
nombre: /dashboard/deposito/articulos
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/articulos.
ruta: /dashboard/deposito/articulos
capa: frontend
permisos: [deposito:crear]
archivos:
  - frontend/src/app/dashboard/deposito/articulos/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-deposito]
  - [uses, component--front-aviso]
  - [uses, component--front-paginador]
terminos: [deposito, articulos, crear]
---

# /dashboard/deposito/articulos

Pantalla /dashboard/deposito/articulos.

- **Ruta:** `/dashboard/deposito/articulos`
- **Permisos referenciados:** `deposito:crear`

## Archivos

- `frontend/src/app/dashboard/deposito/articulos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-paginador|Paginador]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
