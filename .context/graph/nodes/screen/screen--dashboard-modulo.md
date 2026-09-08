---
id: screen--dashboard-modulo
tipo: SCREEN
nombre: "/dashboard/[modulo]"
nivel: L1
dominio: seguridad
resumen: "Pantalla /dashboard/[modulo]."
ruta: /dashboard/[modulo]
capa: frontend
archivos:
  - frontend/src/app/dashboard/[modulo]/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-modulos]
  - [uses, component--front-systemicon]
terminos: [modulo]
---

# /dashboard/[modulo]

Pantalla /dashboard/[modulo].

- **Ruta:** `/dashboard/[modulo]`

## Archivos

- `frontend/src/app/dashboard/[modulo]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-modulos|modulos]]
- `uses` → [[component--front-systemicon|SystemIcon]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
