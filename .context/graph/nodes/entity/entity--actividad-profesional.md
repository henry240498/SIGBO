---
id: entity--actividad-profesional
tipo: ENTITY
nombre: ActividadProfesional
nivel: L1
dominio: personal
resumen: Entidad ActividadProfesional, persistida en personal.actividad_profesional.
tabla: personal.actividad_profesional
archivos:
  - backend/src/shared/entities/actividad-profesional.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-actividad-profesional]
terminos: [actividad, profesional, personal]
---

# ActividadProfesional

Entidad ActividadProfesional, persistida en personal.actividad_profesional.

- **Tabla:** [[table--personal-actividad-profesional|personal.actividad_profesional]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** ActividadProfesionalController, FojaServicioController
- **Servicios:** ActividadProfesionalService, FojaServicioService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/actividad-profesional.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-actividad-profesional|personal.actividad_profesional]]

## Referenciado por

- [[service--personal-actividad-profesional|ActividadProfesionalService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
