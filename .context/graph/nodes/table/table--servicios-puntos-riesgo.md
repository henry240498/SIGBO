---
id: table--servicios-puntos-riesgo
tipo: TABLE
nombre: servicios.puntos_riesgo
nivel: L2
dominio: servicios
resumen: Tabla servicios.puntos_riesgo (14 columnas). Creada en 080_cartografia_operativa.sql.
tabla: puntos_riesgo
archivos:
  - database/migrations/080_cartografia_operativa.sql
edges:
  - [defined_in, file--080-cartografia-operativa]
  - [belongs_to, domain--servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, puntos, riesgo, nombre, categoria, nivel, direccion, latitud, longitud, contacto, telefono, descripcion, activo, creado, actualizado]
---

# servicios.puntos_riesgo

Tabla servicios.puntos_riesgo (14 columnas). Creada en 080_cartografia_operativa.sql.

- **Esquema:** servicios · **Columnas:** 14

## Restricciones CHECK (reglas que la BD impone)

- `nivel_riesgo IN ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')`
- `latitud BETWEEN -90 AND 90`
- `longitud BETWEEN -180 AND 180`

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(150) |
| categoria | NVARCHAR(60) |
| nivel_riesgo | NVARCHAR(10) |
| direccion | NVARCHAR(300) |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| contacto_nombre | NVARCHAR(150) |
| contacto_telefono | NVARCHAR(40) |
| descripcion | NVARCHAR(1000) |
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

- [[table--servicios-preplanes|servicios.preplanes]] `references` →
- [[table--servicios-inspecciones-prevencion|servicios.inspecciones_prevencion]] `references` →
- [[entity--punto-riesgo|PuntoRiesgo]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
