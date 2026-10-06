---
id: table--organizacion-instalaciones
tipo: TABLE
nombre: organizacion.instalaciones
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.instalaciones (6 columnas). Creada en 083_reservas_prevencion.sql.
tabla: instalaciones
archivos:
  - database/migrations/083_reservas_prevencion.sql
edges:
  - [defined_in, file--083-reservas-prevencion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, instalaciones, nombre, capacidad, descripcion, activo, creado]
---

# organizacion.instalaciones

Tabla organizacion.instalaciones (6 columnas). Creada en 083_reservas_prevencion.sql.

- **Esquema:** organizacion · **Columnas:** 6
- **UNIQUE:** `nombre`

## Restricciones CHECK (reglas que la BD impone)

- `capacidad IS NULL OR capacidad >= 1`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| capacidad | INT |
| descripcion | NVARCHAR(500) |
| activo | BIT |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/083_reservas_prevencion.sql`

## Relaciones

- `defined_in` → [[file--083-reservas-prevencion|083_reservas_prevencion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[table--organizacion-reservas-instalacion|organizacion.reservas_instalacion]] `references` →
- [[entity--reserva-prevencion|Instalacion]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
