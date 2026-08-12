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
