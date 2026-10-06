---
id: table--seguridad-pantallas
tipo: TABLE
nombre: seguridad.pantallas
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.pantallas (5 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: pantallas
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, pantallas, codigo, nombre, descripcion, confidencial, aplica, activa]
---

# seguridad.pantallas

Tabla seguridad.pantallas (5 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** seguridad · **Columnas:** 5

## Columnas

| Columna | Tipo |
|---|---|
| codigo | NVARCHAR(10) |
| nombre | NVARCHAR(80) |
| descripcion | NVARCHAR(200) |
| confidencial_aplica | BIT |
| activa | BIT |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/090_despacho_servicio_seguridad.sql`

## Relaciones

- `defined_in` → [[file--090-despacho-servicio-seguridad|090_despacho_servicio_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[table--seguridad-pantalla-permisos|seguridad.pantalla_permisos]] `references` →
- [[table--seguridad-navegacion-eventos|seguridad.navegacion_eventos]] `references` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
