---
id: table--servicios-disponibilidad-horarios
tipo: TABLE
nombre: servicios.disponibilidad_horarios
nivel: L2
dominio: servicios
resumen: Tabla servicios.disponibilidad_horarios (6 columnas). Creada en 088_despacho_nucleo.sql.
tabla: disponibilidad_horarios
archivos:
  - database/migrations/088_despacho_nucleo.sql
edges:
  - [defined_in, file--088-despacho-nucleo]
  - [belongs_to, domain--servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, disponibilidad, horarios, usuario, dia, semana, hora, desde, hasta, creado]
---

# servicios.disponibilidad_horarios

Tabla servicios.disponibilidad_horarios (6 columnas). Creada en 088_despacho_nucleo.sql.

- **Esquema:** servicios · **Columnas:** 6

## Restricciones CHECK (reglas que la BD impone)

- `dia_semana BETWEEN 1 AND 7), /* 1 = lunes */ hora_desde TIME(0) NOT NULL, hora_hasta TIME(0) NOT NULL, creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_disph_creado DEFAULT SYSDATETIMEOFFSET(`

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| dia_semana | TINYINT |
| hora_desde | TIME(0) |
| hora_hasta | TIME(0) |
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
