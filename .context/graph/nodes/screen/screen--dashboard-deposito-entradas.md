---
id: screen--dashboard-deposito-entradas
tipo: SCREEN
nombre: /dashboard/deposito/entradas
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/entradas.
ruta: /dashboard/deposito/entradas
capa: frontend
permisos: [deposito:crear]
archivos:
  - frontend/src/app/dashboard/deposito/entradas/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-equipos]
  - [uses, component--front-deposito]
  - [uses, component--front-aviso]
terminos: [deposito, entradas, crear]
---

# /dashboard/deposito/entradas

Pantalla /dashboard/deposito/entradas.

- **Ruta:** `/dashboard/deposito/entradas`
- **Permisos referenciados:** `deposito:crear`

## Archivos

- `frontend/src/app/dashboard/deposito/entradas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
