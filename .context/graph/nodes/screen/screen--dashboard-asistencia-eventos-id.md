---
id: screen--dashboard-asistencia-eventos-id
tipo: SCREEN
nombre: "/dashboard/asistencia/eventos/[id]"
nivel: L1
dominio: asistencia
resumen: "Pantalla /dashboard/asistencia/eventos/[id]."
ruta: /dashboard/asistencia/eventos/[id]
capa: frontend
permisos: [asistencia:eventos_editar]
archivos:
  - frontend/src/app/dashboard/asistencia/eventos/[id]/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-asistencia]
  - [uses, component--front-parametros]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [asistencia, eventos, editar]
---

# /dashboard/asistencia/eventos/[id]

Pantalla /dashboard/asistencia/eventos/[id].

- **Ruta:** `/dashboard/asistencia/eventos/[id]`
- **Permisos referenciados:** `asistencia:eventos_editar`

## Archivos

- `frontend/src/app/dashboard/asistencia/eventos/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-asistencia|asistencia]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
