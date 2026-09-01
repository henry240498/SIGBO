---
id: screen--dashboard-academia-id
tipo: SCREEN
nombre: "/dashboard/academia/[id]"
nivel: L1
dominio: academia
resumen: "Pantalla /dashboard/academia/[id]."
ruta: /dashboard/academia/[id]
capa: frontend
permisos: [academia:editar_curso, academia:gestionar_instructores, academia:inscribir, academia:calificar, academia:registrar_asistencia]
archivos:
  - frontend/src/app/dashboard/academia/[id]/page.tsx
edges:
  - [belongs_to, domain--academia]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-parametros]
  - [uses, component--front-academia]
  - [uses, component--front-api]
  - [uses, component--front-asistencia]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [academia, editar, curso, gestionar, instructores, inscribir, calificar, registrar, asistencia]
---

# /dashboard/academia/[id]

Pantalla /dashboard/academia/[id].

- **Ruta:** `/dashboard/academia/[id]`
- **Permisos referenciados:** `academia:editar_curso`, `academia:gestionar_instructores`, `academia:inscribir`, `academia:calificar`, `academia:registrar_asistencia`

## Archivos

- `frontend/src/app/dashboard/academia/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-academia|academia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-asistencia|asistencia]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
