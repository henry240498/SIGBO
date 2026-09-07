---
id: table--equipos-prestamos-equipos
tipo: TABLE
nombre: equipos.prestamos_equipos
nivel: L2
dominio: equipos
resumen: Tabla equipos.prestamos_equipos (11 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 018_parametros_y_normalizacion_personal.sql.
tabla: prestamos_equipos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/018_parametros_y_normalizacion_personal.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--equipos]
terminos: [equipos, prestamos, equipo, bombero, servicio, fecha, prestamo, devolucion, estado, observaciones, creado, comprometida]
---

# equipos.prestamos_equipos

Tabla equipos.prestamos_equipos (11 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 018_parametros_y_normalizacion_personal.sql.

- **Esquema:** equipos · **Columnas:** 11

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| fecha_prestamo | DATE |
| fecha_devolucion | DATE |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| fecha_devolucion_comprometida | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/registro`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos/[id]`, `/dashboard/documentos/plantillas`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/socios-protectores`, `/dashboard/guardias/[id]`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/cuarteles`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/turnos`, `/dashboard/personal`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`, `/dashboard/seguridad/usuarios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** BitacoraController, EquipamientoBomberoController, EquiposController
- **Servicios:** BitacoraService, EquipamientoBomberoService, EquiposService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/018_parametros_y_normalizacion_personal.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--equipos|Equipos]]

## Referenciado por

- [[entity--prestamo-equipo|PrestamoEquipo]] `persisted_in` →
- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `reads` →
- [[service--equipos-equipos|EquiposService]] `reads` →
- [[service--guardias-bitacora|BitacoraService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
