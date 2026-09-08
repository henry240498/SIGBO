---
id: entity--log-auditoria
tipo: ENTITY
nombre: LogAuditoria
nivel: L1
dominio: seguridad
resumen: Entidad LogAuditoria, persistida en seguridad.logs_auditoria.
tabla: seguridad.logs_auditoria
archivos:
  - backend/src/shared/entities/log-auditoria.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-logs-auditoria]
terminos: [log, auditoria, logs, seguridad]
---

# LogAuditoria

Entidad LogAuditoria, persistida en seguridad.logs_auditoria.

- **Tabla:** [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]]
- **Columnas mapeadas:** 9

## Donde se usa

- **Pantallas:** `/dashboard/asistencia/auditoria`, `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/guardias/auditoria`, `/dashboard/inteligencia`, `/dashboard/mi-perfil/seguridad`, `/dashboard/organizacion/documentos`, `/dashboard/seguridad/auditoria`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios/[id]`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`
- **Endpoints:** AuditoriaController, DocumentosController, IaAdminConversacionesController, ServiciosController, SesionesController
- **Servicios:** AuditoriaService, ServiciosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/log-auditoria.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]]

## Referenciado por

- [[service--seguridad-auditoria|AuditoriaService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[rule--espanol-y-auditoria|Todo en espanol, y las acciones sensibles quedan auditadas]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
