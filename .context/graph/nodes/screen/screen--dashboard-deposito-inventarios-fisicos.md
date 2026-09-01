---
id: screen--dashboard-deposito-inventarios-fisicos
tipo: SCREEN
nombre: /dashboard/deposito/inventarios-fisicos
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/inventarios-fisicos.
ruta: /dashboard/deposito/inventarios-fisicos
capa: frontend
permisos: [deposito:inventario_fisico]
archivos:
  - frontend/src/app/dashboard/deposito/inventarios-fisicos/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-deposito]
  - [uses, component--front-aviso]
terminos: [deposito, inventarios, fisicos, inventario, fisico]
---

# /dashboard/deposito/inventarios-fisicos

Pantalla /dashboard/deposito/inventarios-fisicos.

- **Ruta:** `/dashboard/deposito/inventarios-fisicos`
- **Permisos referenciados:** `deposito:inventario_fisico`

## Archivos

- `frontend/src/app/dashboard/deposito/inventarios-fisicos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
