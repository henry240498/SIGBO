---
id: table--organizacion-reservas-instalacion
tipo: TABLE
nombre: organizacion.reservas_instalacion
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.reservas_instalacion (14 columnas). Creada en 083_reservas_prevencion.sql.
tabla: reservas_instalacion
archivos:
  - database/migrations/083_reservas_prevencion.sql
edges:
  - [defined_in, file--083-reservas-prevencion]
  - [belongs_to, domain--organizacion]
  - [references, table--organizacion-instalaciones]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [organizacion, reservas, instalacion, titulo, solicitante, nombre, contacto, personas, inicio, fin, estado, motivo, decision, creado, decidido]
---

# organizacion.reservas_instalacion

Tabla organizacion.reservas_instalacion (14 columnas). Creada en 083_reservas_prevencion.sql.

- **Esquema:** organizacion · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `personas IS NULL OR personas >= 1`
- `estado IN ('SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA')`
- `fin > inicio`

## Llaves foraneas

- `instalacion_id` → [[table--organizacion-instalaciones|organizacion.instalaciones]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `decidido_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| instalacion_id | UNIQUEIDENTIFIER |
| titulo | NVARCHAR(150) |
| solicitante_nombre | NVARCHAR(150) |
| contacto | NVARCHAR(100) |
| personas | INT |
| inicio | DATETIMEOFFSET(3) |
| fin | DATETIMEOFFSET(3) |
| estado | NVARCHAR(12) |
| motivo_decision | NVARCHAR(500) |
| creado_por | UNIQUEIDENTIFIER |
| decidido_por | UNIQUEIDENTIFIER |
| decidido_en | DATETIMEOFFSET(3) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/083_reservas_prevencion.sql`

## Relaciones

- `defined_in` → [[file--083-reservas-prevencion|083_reservas_prevencion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `references` → [[table--organizacion-instalaciones|organizacion.instalaciones]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
