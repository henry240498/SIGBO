---
id: table--operaciones-limites-horas-servicio
tipo: TABLE
nombre: operaciones.limites_horas_servicio
nivel: L2
dominio: asistencia
resumen: Tabla operaciones.limites_horas_servicio (7 columnas). Creada en 082_control_personal.sql.
tabla: limites_horas_servicio
archivos:
  - database/migrations/082_control_personal.sql
edges:
  - [defined_in, file--082-control-personal]
  - [belongs_to, domain--asistencia]
  - [references, table--seguridad-usuarios]
terminos: [operaciones, limites, horas, servicio, maximas, periodo, dias, descanso, minimo, activo, creado]
---

# operaciones.limites_horas_servicio

Tabla operaciones.limites_horas_servicio (7 columnas). Creada en 082_control_personal.sql.

- **Esquema:** operaciones · **Columnas:** 7

## Restricciones CHECK (reglas que la BD impone)

- `horas_maximas_periodo BETWEEN 1 AND 744`
- `periodo_dias BETWEEN 1 AND 366`
- `descanso_minimo_horas BETWEEN 0 AND 168`

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| horas_maximas_periodo | INT |
| periodo_dias | INT |
| descanso_minimo_horas | INT |
| activo | BIT |
| creado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/082_control_personal.sql`

## Relaciones

- `defined_in` → [[file--082-control-personal|082_control_personal.sql]]
- `belongs_to` → [[domain--asistencia|Asistencia]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--control-horas-fichaje|LimiteHorasServicio]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
