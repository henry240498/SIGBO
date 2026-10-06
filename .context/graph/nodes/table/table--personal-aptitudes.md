---
id: table--personal-aptitudes
tipo: TABLE
nombre: personal.aptitudes
nivel: L2
dominio: personal
resumen: Tabla personal.aptitudes (11 columnas). Creada en 082_control_personal.sql.
tabla: aptitudes
archivos:
  - database/migrations/082_control_personal.sql
edges:
  - [defined_in, file--082-control-personal]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
  - [references, table--seguridad-usuarios]
terminos: [personal, aptitudes, bombero, categoria, tipo, emitido, vence, observacion, activo, creado, actualizado]
---

# personal.aptitudes

Tabla personal.aptitudes (11 columnas). Creada en 082_control_personal.sql.

- **Esquema:** personal · **Columnas:** 11

## Restricciones CHECK (reglas que la BD impone)

- `categoria IN ('MEDICA', 'LICENCIA', 'OTRA')`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| categoria | NVARCHAR(10) |
| tipo | NVARCHAR(80) |
| emitido_en | DATE |
| vence_en | DATE |
| observacion | NVARCHAR(500) |
| activo | BIT |
| creado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/082_control_personal.sql`

## Relaciones

- `defined_in` → [[file--082-control-personal|082_control_personal.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--aptitud|Aptitud]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
