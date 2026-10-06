---
id: table--servicios-solicitud-moviles
tipo: TABLE
nombre: servicios.solicitud_moviles
nivel: L2
dominio: servicios
resumen: Tabla servicios.solicitud_moviles (3 columnas). Creada en 088_despacho_nucleo.sql.
tabla: solicitud_moviles
archivos:
  - database/migrations/088_despacho_nucleo.sql
edges:
  - [defined_in, file--088-despacho-nucleo]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-solicitudes-despacho]
  - [references, table--vehiculos-vehiculos]
terminos: [servicios, solicitud, moviles, vehiculo]
---

# servicios.solicitud_moviles

Tabla servicios.solicitud_moviles (3 columnas). Creada en 088_despacho_nucleo.sql.

- **Esquema:** servicios · **Columnas:** 3
- **UNIQUE:** `solicitud_id, vehiculo_id`

## Llaves foraneas

- `solicitud_id` → [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| solicitud_id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/088_despacho_nucleo.sql`

## Relaciones

- `defined_in` → [[file--088-despacho-nucleo|088_despacho_nucleo.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
