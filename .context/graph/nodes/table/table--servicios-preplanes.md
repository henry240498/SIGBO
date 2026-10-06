---
id: table--servicios-preplanes
tipo: TABLE
nombre: servicios.preplanes
nivel: L2
dominio: servicios
resumen: Tabla servicios.preplanes (8 columnas). Creada en 080_cartografia_operativa.sql.
tabla: preplanes
archivos:
  - database/migrations/080_cartografia_operativa.sql
edges:
  - [defined_in, file--080-cartografia-operativa]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-puntos-riesgo]
  - [references, table--seguridad-usuarios]
terminos: [servicios, preplanes, punto, riesgo, version, titulo, contenido, vigente, creado]
---

# servicios.preplanes

Tabla servicios.preplanes (8 columnas). Creada en 080_cartografia_operativa.sql.

- **Esquema:** servicios · **Columnas:** 8
- **UNIQUE:** `punto_riesgo_id, version`

## Llaves foraneas

- `punto_riesgo_id` → [[table--servicios-puntos-riesgo|servicios.puntos_riesgo]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| punto_riesgo_id | UNIQUEIDENTIFIER |
| version | INT |
| titulo | NVARCHAR(200) |
| contenido | NVARCHAR(MAX) |
| vigente | BIT |
| creado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/080_cartografia_operativa.sql`

## Relaciones

- `defined_in` → [[file--080-cartografia-operativa|080_cartografia_operativa.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-puntos-riesgo|servicios.puntos_riesgo]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
