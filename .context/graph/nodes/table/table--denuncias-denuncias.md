---
id: table--denuncias-denuncias
tipo: TABLE
nombre: denuncias.denuncias
nivel: L2
dominio: denuncias
resumen: Tabla denuncias.denuncias (22 columnas). Creada en 031_denuncias_rapidas.sql.
tabla: denuncias
archivos:
  - database/migrations/031_denuncias_rapidas.sql
edges:
  - [defined_in, file--031-denuncias-rapidas]
  - [belongs_to, domain--denuncias]
  - [references, table--denuncias-categorias-denuncia]
  - [references, table--seguridad-usuarios]
  - [references, table--servicios-servicios]
  - [references, table--vehiculos-vehiculos]
  - [references, table--seguridad-usuarios]
terminos: [denuncias, codigo, clave, idempotencia, usuario, nombre, denunciante, telefono, categoria, asunto, otro, descripcion, servicio, vehiculo, latitud, longitud, precision, ubicacion, capturada, user, agent, tipo, dispositivo, estado, asignado, creado, actualizado]
---

# denuncias.denuncias

Tabla denuncias.denuncias (22 columnas). Creada en 031_denuncias_rapidas.sql.

- **Esquema:** denuncias · **Columnas:** 22
- **UNIQUE:** `codigo`

## Llaves foraneas

- `categoria_id` → [[table--denuncias-categorias-denuncia|denuncias.categorias_denuncia]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `vehiculo_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `asignado_a` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(30) |
| clave_idempotencia | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| nombre_denunciante | NVARCHAR(160) |
| telefono | NVARCHAR(20) |
| categoria_id | UNIQUEIDENTIFIER |
| asunto_otro | NVARCHAR(180) |
| descripcion | NVARCHAR(MAX) |
| servicio_id | UNIQUEIDENTIFIER |
| vehiculo_id | UNIQUEIDENTIFIER |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| precision_ubicacion | DECIMAL(10,2) |
| ubicacion_capturada_en | DATETIMEOFFSET(3) |
| ip | VARCHAR(45) |
| user_agent | NVARCHAR(500) |
| tipo_dispositivo | NVARCHAR(20) |
| estado | NVARCHAR(25) |
| asignado_a | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`
- **Endpoints:** DenunciasController, DenunciasPublicasController
- **Servicios:** DenunciasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/031_denuncias_rapidas.sql`

## Relaciones

- `defined_in` → [[file--031-denuncias-rapidas|031_denuncias_rapidas.sql]]
- `belongs_to` → [[domain--denuncias|Denuncias]]
- `references` → [[table--denuncias-categorias-denuncia|denuncias.categorias_denuncia]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--denuncias-historial-estados-denuncia|denuncias.historial_estados_denuncia]] `references` →
- [[table--denuncias-evidencias-denuncia|denuncias.evidencias_denuncia]] `references` →
- [[entity--denuncia|Denuncia]] `persisted_in` →
- [[service--denuncias-denuncias|DenunciasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
