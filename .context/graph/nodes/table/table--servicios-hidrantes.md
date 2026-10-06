---
id: table--servicios-hidrantes
tipo: TABLE
nombre: servicios.hidrantes
nivel: L2
dominio: servicios
resumen: Tabla servicios.hidrantes (15 columnas). Creada en 080_cartografia_operativa.sql.
tabla: hidrantes
archivos:
  - database/migrations/080_cartografia_operativa.sql
edges:
  - [defined_in, file--080-cartografia-operativa]
  - [belongs_to, domain--servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, hidrantes, codigo, tipo, direccion, referencia, latitud, longitud, estado, caudal, lpm, ultima, inspeccion, observaciones, activo, creado, actualizado]
---

# servicios.hidrantes

Tabla servicios.hidrantes (15 columnas). Creada en 080_cartografia_operativa.sql.

- **Esquema:** servicios · **Columnas:** 15
- **UNIQUE:** `codigo`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('OPERATIVO', 'FUERA_SERVICIO', 'SIN_VERIFICAR')`
- `caudal_lpm IS NULL OR caudal_lpm >= 0`
- `latitud BETWEEN -90 AND 90`
- `longitud BETWEEN -180 AND 180`

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(30) |
| tipo | NVARCHAR(40) |
| direccion | NVARCHAR(300) |
| referencia | NVARCHAR(300) |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| estado | NVARCHAR(20) |
| caudal_lpm | INT |
| ultima_inspeccion | DATE |
| observaciones | NVARCHAR(500) |
| activo | BIT |
| creado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/080_cartografia_operativa.sql`

## Relaciones

- `defined_in` → [[file--080-cartografia-operativa|080_cartografia_operativa.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--hidrante|Hidrante]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
