---
id: table--vehiculos-vehiculos
tipo: TABLE
nombre: vehiculos.vehiculos
nivel: L2
dominio: vehiculos
resumen: Tabla vehiculos.vehiculos (35 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 023_moviles.sql.
tabla: vehiculos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/023_moviles.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--vehiculos]
terminos: [vehiculos, numero, interno, tipo, marca, modelo, anio, patente, color, chasis, motor, capacidad, carga, pasajeros, kilometraje, actual, combustible, estado, ubicacion, itv, fecha, vencimiento, seguro, empresa, poliza, ultimo, mantenimiento, proximo, cambio, aceite, cubiertas, ultima, revision, bateria, code, fotos, documentos, metadata, creado, actualizado]
---

# vehiculos.vehiculos

Tabla vehiculos.vehiculos (35 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 023_moviles.sql.

- **Esquema:** vehiculos · **Columnas:** 35
- **UNIQUE:** `numero_interno`, `patente`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| numero_interno | NVARCHAR(20) |
| tipo | NVARCHAR(50) |
| marca | NVARCHAR(50) |
| modelo | NVARCHAR(50) |
| anio | INT |
| patente | NVARCHAR(20) |
| color | NVARCHAR(30) |
| numero_chasis | NVARCHAR(50) |
| numero_motor | NVARCHAR(50) |
| capacidad_carga | INT |
| capacidad_pasajeros | INT |
| kilometraje_actual | INT |
| combustible_actual | DECIMAL(10,2) |
| estado | NVARCHAR(20) |
| ubicacion_actual | NVARCHAR(100) |
| itv_fecha | DATE |
| itv_vencimiento | DATE |
| seguro_fecha | DATE |
| seguro_vencimiento | DATE |
| seguro_empresa | NVARCHAR(100) |
| seguro_poliza | NVARCHAR(50) |
| ultimo_mantenimiento | DATE |
| proximo_mantenimiento | DATE |
| ultimo_cambio_aceite | DATE |
| ultimo_cambio_cubiertas | DATE |
| ultima_revision_bateria | DATE |
| qr_code | NVARCHAR(200) |
| fotos | NVARCHAR(MAX) |
| documentos | NVARCHAR(MAX) |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| fecha_baja | DATE |
| motivo_baja | NVARCHAR(MAX) |

## Donde se usa

- **Pantallas:** `/`, `/dashboard/denuncias`, `/dashboard/denuncias/[id]`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/personal/[id]`, `/dashboard/publicaciones`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** DenunciasController, DenunciasPublicasController, EquiposController, InspeccionesMovilController, PublicacionesController, ServiciosController, VehiculosAutorizadosController, VehiculosController
- **Servicios:** DenunciasService, EquiposService, InspeccionesMovilService, PublicacionesService, ServiciosService, VehiculosAutorizadosService, VehiculosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/023_moviles.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]

## Referenciado por

- [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]] `references` →
- [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]] `references` →
- [[table--denuncias-denuncias|denuncias.denuncias]] `references` →
- [[entity--vehiculo|Vehiculo]] `persisted_in` →
- [[service--denuncias-denuncias|DenunciasService]] `reads` →
- [[service--equipos-equipos|EquiposService]] `reads` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `reads` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `reads` →
- [[service--servicios-servicios|ServiciosService]] `reads` →
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `reads` →
- [[service--vehiculos-vehiculos|VehiculosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
