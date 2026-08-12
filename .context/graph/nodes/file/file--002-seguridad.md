---
id: file--002-seguridad
tipo: FILE
nombre: 002_seguridad.sql
nivel: L2
resumen: Esquema seguridad (corazon del sistema)
archivos:
  - database/migrations/002_seguridad.sql
terminos: [002, seguridad]
---

# 002_seguridad.sql

Esquema seguridad (corazon del sistema)


## Archivos

- `database/migrations/002_seguridad.sql`

## Referenciado por

- [[table--seguridad-usuarios|seguridad.usuarios]] `defined_in` →
- [[table--seguridad-roles|seguridad.roles]] `defined_in` →
- [[table--seguridad-permisos|seguridad.permisos]] `defined_in` →
- [[table--seguridad-asignacion-roles|seguridad.asignacion_roles]] `defined_in` →
- [[table--seguridad-asignacion-permisos-directos|seguridad.asignacion_permisos_directos]] `defined_in` →
- [[table--seguridad-asignacion-permisos-rol|seguridad.asignacion_permisos_rol]] `defined_in` →
- [[table--seguridad-restricciones|seguridad.restricciones]] `defined_in` →
- [[table--seguridad-sesiones|seguridad.sesiones]] `defined_in` →
- [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]] `defined_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
