---
id: table--organizacion-parametros
tipo: TABLE
nombre: organizacion.parametros
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql, 024_equipos.sql, 025_guardias.sql.
tabla: parametros
archivos:
  - database/migrations/018_parametros_y_normalizacion_personal.sql
  - database/migrations/020_asistencia.sql
  - database/migrations/024_equipos.sql
  - database/migrations/025_guardias.sql
edges:
  - [defined_in, file--018-parametros-y-normalizacion-personal]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, parametros, tipo, padre, nombre, normalizado, codigo, descripcion, orden, estado, creado, actualizado, eliminado]
---

# organizacion.parametros

Tabla organizacion.parametros (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql, modificada por 020_asistencia.sql, 024_equipos.sql, 025_guardias.sql.

- **Esquema:** organizacion · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA' )`
- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA', 'UBICACION_EQUIPO' )`
- `tipo IN ( 'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA', 'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA', 'UBICACION_EQUIPO','ESTADO_PRESENCIA_GUARDIA','SECTOR_ESTACION' )`

## Llaves foraneas

- `padre_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(40) |
| padre_id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(200) |
| nombre_normalizado | NVARCHAR(200) |
| codigo | NVARCHAR(20) |
| descripcion | NVARCHAR(MAX) |
| orden | INT |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| eliminado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/guardias/[id]`, `/dashboard/organizacion/parametros`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`
- **Endpoints:** DashboardAsistenciaController, EquiposController, FojaServicioController, IdiomasController, InspeccionesEstacionController, ParametrosController
- **Servicios:** DashboardAsistenciaService, EquiposService, FojaServicioService, IdiomasService, InspeccionesEstacionService, ParametrosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/018_parametros_y_normalizacion_personal.sql`
- `database/migrations/020_asistencia.sql`
- `database/migrations/024_equipos.sql`
- `database/migrations/025_guardias.sql`

## Relaciones

- `defined_in` → [[file--018-parametros-y-normalizacion-personal|018_parametros_y_normalizacion_personal.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--personal-seguros-bombero|personal.seguros_bombero]] `references` →
- [[table--personal-seguros-bombero|personal.seguros_bombero]] `references` →
- [[table--operaciones-tolerancias-asistencia|operaciones.tolerancias_asistencia]] `references` →
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `references` →
- [[entity--parametro|Parametro]] `persisted_in` →
- [[service--equipos-equipos|EquiposService]] `reads` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `reads` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `reads` →
- [[service--organizacion-parametros|ParametrosService]] `reads` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →
- [[service--personal-idiomas|IdiomasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
