---
id: table--servicios-servicios
tipo: TABLE
nombre: servicios.servicios
nivel: L2
dominio: servicios
resumen: Tabla servicios.servicios (30 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql.
tabla: servicios
archivos:
  - database/migrations/007_servicios.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--007-servicios]
  - [belongs_to, domain--servicios]
terminos: [servicios, tipo, servicio, numero, fecha, hora, aviso, salida, llegada, fin, direccion, ciudad, coordenadas, lat, lon, descripcion, gravedad, estado, vehiculo, principal, oficial, jefe, kilometraje, total, combustible, usado, tiempo, minutos, informe, conclusiones, recomendaciones, fotos, documentos, creado, actualizado]
---

# servicios.servicios

Tabla servicios.servicios (30 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** servicios · **Columnas:** 30
- **UNIQUE:** `numero_servicio`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_servicio_id | UNIQUEIDENTIFIER |
| numero_servicio | NVARCHAR(20) |
| fecha_hora_aviso | DATETIMEOFFSET(3) |
| fecha_hora_salida | DATETIMEOFFSET(3) |
| fecha_hora_llegada | DATETIMEOFFSET(3) |
| fecha_hora_fin | DATETIMEOFFSET(3) |
| direccion | NVARCHAR(MAX) |
| ciudad | NVARCHAR(100) |
| coordenadas_lat | DECIMAL(10,8) |
| coordenadas_lon | DECIMAL(11,8) |
| descripcion | NVARCHAR(MAX) |
| gravedad | NVARCHAR(20) |
| estado | NVARCHAR(20) |
| vehiculo_principal_id | UNIQUEIDENTIFIER |
| oficial_ro_id | UNIQUEIDENTIFIER |
| jefe_servicio_id | UNIQUEIDENTIFIER |
| kilometraje_salida | INT |
| kilometraje_llegada | INT |
| kilometraje_total | AS |
| combustible_usado | DECIMAL(10,2) |
| tiempo_total_minutos | INT |
| informe | NVARCHAR(MAX) |
| conclusiones | NVARCHAR(MAX) |
| recomendaciones | NVARCHAR(MAX) |
| fotos | NVARCHAR(MAX) |
| documentos | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Archivos

- `database/migrations/007_servicios.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--007-servicios|007_servicios.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]] `references` →
- [[entity--servicio|Servicio]] `persisted_in` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `reads` →
- [[service--servicios-servicios|ServiciosService]] `reads` →
- [[service--vehiculos-vehiculos|VehiculosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
