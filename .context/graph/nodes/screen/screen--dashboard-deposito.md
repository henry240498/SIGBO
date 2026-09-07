---
id: screen--dashboard-deposito
tipo: SCREEN
nombre: /dashboard/deposito
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito.
ruta: /dashboard/deposito
capa: frontend
archivos:
  - frontend/src/app/dashboard/deposito/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-parametros]
  - [uses, component--front-deposito]
terminos: [deposito]
---

# /dashboard/deposito

Pantalla /dashboard/deposito.

- **Ruta:** `/dashboard/deposito`

## Archivos

- `frontend/src/app/dashboard/deposito/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-deposito|deposito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
