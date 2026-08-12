---
id: table--servicios-tipos-servicio
tipo: TABLE
nombre: servicios.tipos_servicio
nivel: L2
dominio: servicios
resumen: Tabla servicios.tipos_servicio (13 columnas). Creada en 007_servicios.sql.
tabla: tipos_servicio
archivos:
  - database/migrations/007_servicios.sql
edges:
  - [defined_in, file--007-servicios]
  - [belongs_to, domain--servicios]
terminos: [servicios, tipos, servicio, codigo, nombre, descripcion, color, icono, prioridad, requiere, vehiculo, tiempo, estimado, minutos, activo, metadata, creado]
---

# servicios.tipos_servicio

Tabla servicios.tipos_servicio (13 columnas). Creada en 007_servicios.sql.

- **Esquema:** servicios · **Columnas:** 13
- **UNIQUE:** `codigo`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(100) |
| descripcion | NVARCHAR(MAX) |
| color | NVARCHAR(7) |
| icono | NVARCHAR(50) |
| prioridad | INT |
| requiere_ro | BIT |
| requiere_vehiculo | BIT |
| tiempo_estimado_minutos | INT |
| activo | BIT |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/007_servicios.sql`

## Relaciones

- `defined_in` → [[file--007-servicios|007_servicios.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[entity--tipo-servicio|TipoServicio]] `persisted_in` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `reads` →
- [[service--servicios-servicios|ServiciosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
