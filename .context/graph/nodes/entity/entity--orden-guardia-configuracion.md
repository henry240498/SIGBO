---
id: entity--orden-guardia-configuracion
tipo: ENTITY
nombre: OrdenGuardiaConfiguracion
nivel: L1
dominio: asistencia
resumen: "Configuracion institucional de la Orden de Guardia (fila unica, patron ConfiguracionSistema/AparienciaService): textos de plantilla, reglas de reemplazo (tambien enforced como validacion real, no solo texto), pie de pagina y los dos cargos firmantes -- nunca nombres fijos en codigo, se resuelven contra `organizacion.designaciones` al generar el snapshot."
tabla: operaciones.orden_guardia_configuracion
archivos:
  - backend/src/shared/entities/orden-guardia-configuracion.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-orden-guardia-configuracion]
terminos: [orden, guardia, configuracion, operaciones]
---

# OrdenGuardiaConfiguracion

Configuracion institucional de la Orden de Guardia (fila unica, patron ConfiguracionSistema/AparienciaService): textos de plantilla, reglas de reemplazo (tambien enforced como validacion real, no solo texto), pie de pagina y los dos cargos firmantes -- nunca nombres fijos en codigo, se resuelven contra `organizacion.designaciones` al generar el snapshot.

- **Tabla:** [[table--operaciones-orden-guardia-configuracion|operaciones.orden_guardia_configuracion]]
- **Columnas mapeadas:** 11

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** OrdenesGuardiaController
- **Servicios:** OrdenGuardiaConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/orden-guardia-configuracion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-orden-guardia-configuracion|operaciones.orden_guardia_configuracion]]

## Referenciado por

- [[service--guardias-orden-guardia-configuracion|OrdenGuardiaConfiguracionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
