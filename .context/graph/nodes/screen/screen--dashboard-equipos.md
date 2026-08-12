---
id: screen--dashboard-equipos
tipo: SCREEN
nombre: /dashboard/equipos
nivel: L1
dominio: equipos
resumen: Pantalla /dashboard/equipos.
ruta: /dashboard/equipos
capa: frontend
permisos: [equipos:crear]
archivos:
  - frontend/src/app/dashboard/equipos/page.tsx
edges:
  - [belongs_to, domain--equipos]
  - [uses, component--front-api]
  - [uses, component--front-equipos]
terminos: [equipos, crear]
---

# /dashboard/equipos

Pantalla /dashboard/equipos.

- **Ruta:** `/dashboard/equipos`
- **Permisos referenciados:** `equipos:crear`

## Archivos

- `frontend/src/app/dashboard/equipos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-equipos|equipos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
