---
id: screen--dashboard-deposito-inventarios-fisicos-id
tipo: SCREEN
nombre: "/dashboard/deposito/inventarios-fisicos/[id]"
nivel: L1
dominio: deposito
resumen: "Pantalla /dashboard/deposito/inventarios-fisicos/[id]."
ruta: /dashboard/deposito/inventarios-fisicos/[id]
capa: frontend
permisos: [deposito:inventario_fisico]
archivos:
  - frontend/src/app/dashboard/deposito/inventarios-fisicos/[id]/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-equipos]
  - [uses, component--front-deposito]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [deposito, inventarios, fisicos, inventario, fisico]
---

# /dashboard/deposito/inventarios-fisicos/[id]

Pantalla /dashboard/deposito/inventarios-fisicos/[id].

- **Ruta:** `/dashboard/deposito/inventarios-fisicos/[id]`
- **Permisos referenciados:** `deposito:inventario_fisico`

## Archivos

- `frontend/src/app/dashboard/deposito/inventarios-fisicos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
