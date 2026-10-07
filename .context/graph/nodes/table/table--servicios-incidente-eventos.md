---
id: table--servicios-incidente-eventos
tipo: TABLE
nombre: servicios.incidente_eventos
nivel: L2
dominio: servicios
resumen: Tabla servicios.incidente_eventos (22 columnas). Creada en 093_centro_operaciones_incidentes.sql.
tabla: incidente_eventos
archivos:
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--093-centro-operaciones-incidentes]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
  - [references, table--vehiculos-vehiculos]
terminos: [servicios, incidente, eventos, servicio, tipo, titulo, ocurrido, registrado, usuario, nombre, vehiculo, despacho, latitud, longitud, precision, fase, anterior, nueva, fuente, datos, critico, origen, dispositivo, clave, idempotencia]
---

# servicios.incidente_eventos

Tabla servicios.incidente_eventos (22 columnas). Creada en 093_centro_operaciones_incidentes.sql.

- **Esquema:** servicios · **Columnas:** 22

## Restricciones CHECK (reglas que la BD impone)

- `datos IS NULL OR ISJSON(datos) = 1`
- `origen IN ('WEB', 'APP', 'SISTEMA')`
- `tipo IN ( 'SERVICIO_RECIBIDO', 'LLAMADO_VINCULADO', 'FASE_CAMBIADA', 'PRIORIDAD_CAMBIADA', 'MOVIL_DESPACHADO', 'MOVIL_SALIO', 'MOVIL_LLEGO', 'MOVIL_RETORNA', 'MOVIL_DISPONIBLE', 'DESPACHO_CANCELADO', 'TRIPULACION_AJUSTADA', 'PERSONAL_SUMADO', 'COMANDO_ASUMIDO', 'SITUACION_MARCADA', 'SITUACION_RESUELTA', 'RECURSO_SOLICITADO', 'RECURSO_ACTUALIZADO', 'VICTIMA_REGISTRADA', 'FOTO_TOMADA', 'MENSAJE', 'COMUNICACION', 'EMERGENCIA', 'EMERGENCIA_ATENDIDA', 'RESULTADO_DECLARADO', 'INCIDENTE_CERRADO', 'PERSONAL_ENTRA_ZONA', 'PERSONAL_SALE_ZONA', 'RECUENTO_PERSONAL')`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | BIGINT |
| servicio_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(40) |
| titulo | NVARCHAR(200) |
| ocurrido_en | DATETIMEOFFSET(3) |
| registrado_en | DATETIMEOFFSET(3) |
| usuario_id | UNIQUEIDENTIFIER |
| usuario_nombre | NVARCHAR(120) |
| vehiculo_id | UNIQUEIDENTIFIER |
| despacho_id | UNIQUEIDENTIFIER |
| latitud | DECIMAL(10, 8) |
| longitud | DECIMAL(11, 8) |
| precision_m | DECIMAL(7, 1) |
| fase_anterior | NVARCHAR(20) |
| fase_nueva | NVARCHAR(20) |
| fuente | NVARCHAR(30) |
| fuente_id | NVARCHAR(64) |
| datos | NVARCHAR(MAX) |
| critico | BIT |
| origen | NVARCHAR(10) |
| dispositivo | NVARCHAR(200) |
| clave_idempotencia | NVARCHAR(64) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--093-centro-operaciones-incidentes|093_centro_operaciones_incidentes.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Referenciado por

- [[entity--incidente|IncidenteEvento]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
