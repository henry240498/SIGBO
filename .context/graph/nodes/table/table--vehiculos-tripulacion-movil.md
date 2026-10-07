---
id: table--vehiculos-tripulacion-movil
tipo: TABLE
nombre: vehiculos.tripulacion_movil
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.tripulacion_movil (6 columnas). Creada en 093_centro_operaciones_incidentes.sql.
tabla: tripulacion_movil
archivos:
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--093-centro-operaciones-incidentes]
  - [belongs_to, domain--vehiculos]
  - [references, table--vehiculos-vehiculos]
  - [references, table--personal-bomberos]
  - [references, table--seguridad-usuarios]
terminos: [vehiculos, tripulacion, movil, vehiculo, bombero, funcion, asignado]
---

# vehiculos.tripulacion_movil

Tabla vehiculos.tripulacion_movil (6 columnas). Creada en 093_centro_operaciones_incidentes.sql.

- **Esquema:** vehiculos · **Columnas:** 6
- **UNIQUE:** `bombero_id`

## Llaves foraneas

- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `asignado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| funcion | NVARCHAR(40) |
| asignado_por | UNIQUEIDENTIFIER |
| asignado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--093-centro-operaciones-incidentes|093_centro_operaciones_incidentes.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--tripulacion-movil|TripulacionMovil]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
