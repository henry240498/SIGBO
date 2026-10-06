---
id: screen--dashboard-asistencia-ausencias
tipo: SCREEN
nombre: /dashboard/asistencia/ausencias
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia/ausencias.
ruta: /dashboard/asistencia/ausencias
capa: frontend
permisos: [ausencias:solicitar, ausencias:decidir]
archivos:
  - frontend/src/app/dashboard/asistencia/ausencias/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-ausencias]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-inputprovider]
terminos: [asistencia, ausencias, solicitar, decidir]
---

# /dashboard/asistencia/ausencias

Pantalla /dashboard/asistencia/ausencias.

- **Ruta:** `/dashboard/asistencia/ausencias`
- **Permisos referenciados:** `ausencias:solicitar`, `ausencias:decidir`

## Archivos

- `frontend/src/app/dashboard/asistencia/ausencias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-ausencias|ausencias]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-inputprovider|InputProvider]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
