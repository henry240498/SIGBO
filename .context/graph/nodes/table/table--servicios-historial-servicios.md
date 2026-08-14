---
id: table--servicios-historial-servicios
tipo: TABLE
nombre: servicios.historial_servicios
nivel: L2
dominio: servicios
resumen: Tabla servicios.historial_servicios (10 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql.
tabla: historial_servicios
archivos:
  - database/migrations/007_servicios.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--007-servicios]
  - [belongs_to, domain--servicios]
terminos: [servicios, historial, servicio, timestamp, evento, tipo, latitud, longitud, velocidad, kmh, direccion, datos, creado]
---

# servicios.historial_servicios

Tabla servicios.historial_servicios (10 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** servicios · **Columnas:** 10

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| timestamp_evento | DATETIMEOFFSET(3) |
| tipo_evento | NVARCHAR(30) |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| velocidad_kmh | DECIMAL(5,2) |
| direccion | NVARCHAR(MAX) |
| datos | NVARCHAR(MAX) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/007_servicios.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--007-servicios|007_servicios.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
