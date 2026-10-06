---
id: screen--dashboard-servicios-llamados
tipo: SCREEN
nombre: /dashboard/servicios/llamados
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios/llamados.
ruta: /dashboard/servicios/llamados
capa: frontend
permisos: [servicios:crear, servicios:editar]
archivos:
  - frontend/src/app/dashboard/servicios/llamados/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-api]
  - [uses, component--front-flota]
  - [uses, component--front-llamados]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-inputprovider]
terminos: [servicios, llamados, crear, editar]
---

# /dashboard/servicios/llamados

Pantalla /dashboard/servicios/llamados.

- **Ruta:** `/dashboard/servicios/llamados`
- **Permisos referenciados:** `servicios:crear`, `servicios:editar`

## Archivos

- `frontend/src/app/dashboard/servicios/llamados/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-flota|flota]]
- `uses` → [[component--front-llamados|llamados]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-inputprovider|InputProvider]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
