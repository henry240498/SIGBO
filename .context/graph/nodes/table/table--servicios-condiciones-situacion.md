---
id: table--servicios-condiciones-situacion
tipo: TABLE
nombre: servicios.condiciones_situacion
nivel: L2
dominio: servicios
resumen: Tabla servicios.condiciones_situacion (8 columnas). Creada en 093_centro_operaciones_incidentes.sql.
tabla: condiciones_situacion
archivos:
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--093-centro-operaciones-incidentes]
  - [belongs_to, domain--servicios]
terminos: [servicios, condiciones, situacion, codigo, nombre, grupo, critica, excluyente, orden, activo]
---

# servicios.condiciones_situacion

Tabla servicios.condiciones_situacion (8 columnas). Creada en 093_centro_operaciones_incidentes.sql.

- **Esquema:** servicios · **Columnas:** 8

## Restricciones CHECK (reglas que la BD impone)

- `grupo IN ('SITUACION', 'RIESGO')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(40) |
| nombre | NVARCHAR(80) |
| grupo | NVARCHAR(12) |
| critica | BIT |
| grupo_excluyente | NVARCHAR(30) |
| orden | INT |
| activo | BIT |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--093-centro-operaciones-incidentes|093_centro_operaciones_incidentes.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
