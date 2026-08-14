---
id: table--vehiculos-vehiculos
tipo: TABLE
nombre: vehiculos.vehiculos
nivel: L2
dominio: vehiculos
<<<<<<< Updated upstream
resumen: Tabla vehiculos.vehiculos (35 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 023_moviles.sql.
tabla: vehiculos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/023_moviles.sql
=======
resumen: Tabla vehiculos.vehiculos (33 columnas). Creada en 006_vehiculos_equipos.sql.
tabla: vehiculos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
>>>>>>> Stashed changes
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--vehiculos]
terminos: [vehiculos, numero, interno, tipo, marca, modelo, anio, patente, color, chasis, motor, capacidad, carga, pasajeros, kilometraje, actual, combustible, estado, ubicacion, itv, fecha, vencimiento, seguro, empresa, poliza, ultimo, mantenimiento, proximo, cambio, aceite, cubiertas, ultima, revision, bateria, code, fotos, documentos, metadata, creado, actualizado]
---

# vehiculos.vehiculos

<<<<<<< Updated upstream
Tabla vehiculos.vehiculos (35 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 023_moviles.sql.

- **Esquema:** vehiculos · **Columnas:** 35
=======
Tabla vehiculos.vehiculos (33 columnas). Creada en 006_vehiculos_equipos.sql.

- **Esquema:** vehiculos · **Columnas:** 33
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
| fecha_baja | DATE |
| motivo_baja | NVARCHAR(MAX) |
=======
>>>>>>> Stashed changes

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
<<<<<<< Updated upstream
- `database/migrations/023_moviles.sql`
=======
>>>>>>> Stashed changes

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--vehiculos|Vehículos]]

## Referenciado por

- [[table--personal-vehiculos-autorizados|personal.vehiculos_autorizados]] `references` →
- [[entity--vehiculo|Vehiculo]] `persisted_in` →
<<<<<<< Updated upstream
- [[service--equipos-equipos|EquiposService]] `reads` →
=======
>>>>>>> Stashed changes
- [[service--publicaciones-publicaciones|PublicacionesService]] `reads` →
- [[service--servicios-servicios|ServiciosService]] `reads` →
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `reads` →
- [[service--vehiculos-vehiculos|VehiculosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
