---
id: screen--dashboard-equipos-id
tipo: SCREEN
nombre: "/dashboard/equipos/[id]"
nivel: L1
dominio: equipos
resumen: "Pantalla /dashboard/equipos/[id]."
ruta: /dashboard/equipos/[id]
capa: frontend
permisos: [equipos:editar, equipos:prestar]
archivos:
  - frontend/src/app/dashboard/equipos/[id]/page.tsx
edges:
  - [belongs_to, domain--equipos]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-vehiculos]
  - [uses, component--front-equipos]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [equipos, editar, prestar]
---

# /dashboard/equipos/[id]

Pantalla /dashboard/equipos/[id].

- **Ruta:** `/dashboard/equipos/[id]`
- **Permisos referenciados:** `equipos:editar`, `equipos:prestar`

## Archivos

- `frontend/src/app/dashboard/equipos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-vehiculos|vehiculos]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
