---
id: table--servicios-inspecciones-prevencion
tipo: TABLE
nombre: servicios.inspecciones_prevencion
nivel: L2
dominio: servicios
resumen: Tabla servicios.inspecciones_prevencion (11 columnas). Creada en 083_reservas_prevencion.sql.
tabla: inspecciones_prevencion
archivos:
  - database/migrations/083_reservas_prevencion.sql
edges:
  - [defined_in, file--083-reservas-prevencion]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-puntos-riesgo]
  - [references, table--seguridad-usuarios]
terminos: [servicios, inspecciones, prevencion, punto, riesgo, establecimiento, direccion, fecha, inspector, resultado, observaciones, certificado, numero, vence, creado]
---

# servicios.inspecciones_prevencion

Tabla servicios.inspecciones_prevencion (11 columnas). Creada en 083_reservas_prevencion.sql.

- **Esquema:** servicios · **Columnas:** 11

## Restricciones CHECK (reglas que la BD impone)

- `resultado IN ('APROBADO', 'CON_OBSERVACIONES', 'RECHAZADO')`

## Llaves foraneas

- `punto_riesgo_id` → [[table--servicios-puntos-riesgo|servicios.puntos_riesgo]]
- `inspector_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| punto_riesgo_id | UNIQUEIDENTIFIER |
| establecimiento | NVARCHAR(150) |
| direccion | NVARCHAR(300) |
| fecha | DATE |
| inspector_id | UNIQUEIDENTIFIER |
| resultado | NVARCHAR(20) |
| observaciones | NVARCHAR(1000) |
| certificado_numero | NVARCHAR(40) |
| certificado_vence | DATE |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/083_reservas_prevencion.sql`

## Relaciones

- `defined_in` → [[file--083-reservas-prevencion|083_reservas_prevencion.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-puntos-riesgo|servicios.puntos_riesgo]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
