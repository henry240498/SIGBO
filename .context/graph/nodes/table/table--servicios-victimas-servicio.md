---
id: table--servicios-victimas-servicio
tipo: TABLE
nombre: servicios.victimas_servicio
nivel: L2
dominio: servicios
resumen: Tabla servicios.victimas_servicio (7 columnas). Creada en 086_campo_adjuntos_ausencias.sql.
tabla: victimas_servicio
archivos:
  - database/migrations/086_campo_adjuntos_ausencias.sql
edges:
  - [defined_in, file--086-campo-adjuntos-ausencias]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, victimas, servicio, categoria, cantidad, observacion, registrado, creado]
---

# servicios.victimas_servicio

Tabla servicios.victimas_servicio (7 columnas). Creada en 086_campo_adjuntos_ausencias.sql.

- **Esquema:** servicios · **Columnas:** 7

## Restricciones CHECK (reglas que la BD impone)

- `categoria IN ('RESCATADA', 'HERIDA', 'FALLECIDA', 'EVACUADA')`
- `cantidad BETWEEN 1 AND 500`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `registrado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| categoria | NVARCHAR(10) |
| cantidad | INT |
| observacion | NVARCHAR(500) |
| registrado_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/086_campo_adjuntos_ausencias.sql`

## Relaciones

- `defined_in` → [[file--086-campo-adjuntos-ausencias|086_campo_adjuntos_ausencias.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
