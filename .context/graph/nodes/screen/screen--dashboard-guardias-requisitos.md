---
id: screen--dashboard-guardias-requisitos
tipo: SCREEN
nombre: /dashboard/guardias/requisitos
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/requisitos.
ruta: /dashboard/guardias/requisitos
capa: frontend
permisos: [guardias:requisitos]
archivos:
  - frontend/src/app/dashboard/guardias/requisitos/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-guardias]
  - [uses, component--front-aviso]
terminos: [guardias, requisitos]
---

# /dashboard/guardias/requisitos

Pantalla /dashboard/guardias/requisitos.

- **Ruta:** `/dashboard/guardias/requisitos`
- **Permisos referenciados:** `guardias:requisitos`

## Archivos

- `frontend/src/app/dashboard/guardias/requisitos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
