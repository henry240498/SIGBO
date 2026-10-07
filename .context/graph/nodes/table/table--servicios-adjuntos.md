---
id: table--servicios-adjuntos
tipo: TABLE
nombre: servicios.adjuntos
nivel: L2
dominio: servicios
resumen: Tabla servicios.adjuntos (14 columnas). Creada en 086_campo_adjuntos_ausencias.sql, modificada por 093_centro_operaciones_incidentes.sql.
tabla: adjuntos
archivos:
  - database/migrations/086_campo_adjuntos_ausencias.sql
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--086-campo-adjuntos-ausencias]
  - [belongs_to, domain--servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, adjuntos, entidad, tipo, descripcion, referencia, tamano, bytes, clave, idempotencia, subido, tomado, creado, latitud, longitud, categoria]
---

# servicios.adjuntos

Tabla servicios.adjuntos (14 columnas). Creada en 086_campo_adjuntos_ausencias.sql, modificada por 093_centro_operaciones_incidentes.sql.

- **Esquema:** servicios · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `entidad IN ('SERVICIO', 'DESPACHO', 'VEHICULO', 'HIDRANTE', 'PUNTO_RIESGO')`
- `tipo IN ('FOTO', 'FIRMA')`
- `categoria IS NULL OR categoria IN ( 'DANO', 'VICTIMA', 'RIESGO', 'VEHICULO', 'ESTRUCTURA', 'EQUIPAMIENTO', 'EVIDENCIA', 'OTRO')`

## Llaves foraneas

- `subido_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| entidad | NVARCHAR(20) |
| entidad_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(10) |
| descripcion | NVARCHAR(200) |
| referencia | NVARCHAR(200) |
| tamano_bytes | INT |
| clave_idempotencia | NVARCHAR(64) |
| subido_por | UNIQUEIDENTIFIER |
| tomado_en | DATETIMEOFFSET(3) |
| creado_en | DATETIMEOFFSET(3) |
| latitud | DECIMAL(10, 8) |
| longitud | DECIMAL(11, 8) |
| categoria | NVARCHAR(12) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/086_campo_adjuntos_ausencias.sql`
- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--086-campo-adjuntos-ausencias|086_campo_adjuntos_ausencias.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--campo|Adjunto]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
