---
id: table--servicios-disponibilidad-personal
tipo: TABLE
nombre: servicios.disponibilidad_personal
nivel: L2
dominio: servicios
resumen: Tabla servicios.disponibilidad_personal (10 columnas). Creada en 088_despacho_nucleo.sql.
tabla: disponibilidad_personal
archivos:
  - database/migrations/088_despacho_nucleo.sql
edges:
  - [defined_in, file--088-despacho-nucleo]
  - [belongs_to, domain--servicios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, disponibilidad, personal, usuario, estado, desde, solicitud, usa, horario, temporal, hasta, ultima, actividad, version, actualizado]
---

# servicios.disponibilidad_personal

Tabla servicios.disponibilidad_personal (10 columnas). Creada en 088_despacho_nucleo.sql.

- **Esquema:** servicios · **Columnas:** 10
- **UNIQUE:** `usuario_id`

## Restricciones CHECK (reglas que la BD impone)

- `estado IN ('NO_DISPONIBLE', 'AL_LLAMADO', 'EN_BASE', 'EN_CAMINO', 'EN_SERVICIO')`

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| desde | DATETIMEOFFSET(3) |
| solicitud_id | UNIQUEIDENTIFIER |
| usa_horario | BIT |
| temporal_hasta | DATETIMEOFFSET(3) |
| ultima_actividad | DATETIMEOFFSET(3) |
| version | INT |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/088_despacho_nucleo.sql`

## Relaciones

- `defined_in` → [[file--088-despacho-nucleo|088_despacho_nucleo.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--despacho-operativo|DisponibilidadPersonal]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
