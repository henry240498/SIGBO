---
id: table--servicios-disponibilidad-excepciones
tipo: TABLE
nombre: servicios.disponibilidad_excepciones
nivel: L2
dominio: servicios
resumen: Tabla servicios.disponibilidad_excepciones (9 columnas). Creada en 088_despacho_nucleo.sql.
tabla: disponibilidad_excepciones
archivos:
  - database/migrations/088_despacho_nucleo.sql
edges:
  - [defined_in, file--088-despacho-nucleo]
  - [belongs_to, domain--servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, disponibilidad, excepciones, usuario, fecha, desde, hasta, disponible, hora, motivo, creado]
---

# servicios.disponibilidad_excepciones

Tabla servicios.disponibilidad_excepciones (9 columnas). Creada en 088_despacho_nucleo.sql.

- **Esquema:** servicios · **Columnas:** 9

## Restricciones CHECK (reglas que la BD impone)

- `fecha_hasta >= fecha_desde`

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| fecha_desde | DATE |
| fecha_hasta | DATE |
| disponible | BIT |
| hora_desde | TIME(0) |
| hora_hasta | TIME(0) |
| motivo | NVARCHAR(200) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/088_despacho_nucleo.sql`

## Relaciones

- `defined_in` → [[file--088-despacho-nucleo|088_despacho_nucleo.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
