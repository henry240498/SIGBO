---
id: screen--dashboard-deposito-articulos-id
tipo: SCREEN
nombre: "/dashboard/deposito/articulos/[id]"
nivel: L1
dominio: deposito
resumen: "Pantalla /dashboard/deposito/articulos/[id]."
ruta: /dashboard/deposito/articulos/[id]
capa: frontend
permisos: [deposito:editar, deposito:crear]
archivos:
  - frontend/src/app/dashboard/deposito/articulos/[id]/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-personal]
  - [uses, component--front-vehiculos]
  - [uses, component--front-deposito]
terminos: [deposito, articulos, editar, crear]
---

# /dashboard/deposito/articulos/[id]

Pantalla /dashboard/deposito/articulos/[id].

- **Ruta:** `/dashboard/deposito/articulos/[id]`
- **Permisos referenciados:** `deposito:editar`, `deposito:crear`

## Archivos

- `frontend/src/app/dashboard/deposito/articulos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-vehiculos|vehiculos]]
- `uses` → [[component--front-deposito|deposito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
