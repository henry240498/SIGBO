---
id: table--denuncias-evidencias-denuncia
tipo: TABLE
nombre: denuncias.evidencias_denuncia
nivel: L2
dominio: denuncias
resumen: Tabla denuncias.evidencias_denuncia (10 columnas). Creada en 031_denuncias_rapidas.sql.
tabla: evidencias_denuncia
archivos:
  - database/migrations/031_denuncias_rapidas.sql
edges:
  - [defined_in, file--031-denuncias-rapidas]
  - [belongs_to, domain--denuncias]
  - [references, table--denuncias-denuncias]
terminos: [denuncias, evidencias, denuncia, tipo, nombre, original, almacenado, mime, type, tamano, bytes, duracion, segundos, hash, sha256, creado]
---

# denuncias.evidencias_denuncia

Tabla denuncias.evidencias_denuncia (10 columnas). Creada en 031_denuncias_rapidas.sql.

- **Esquema:** denuncias · **Columnas:** 10

## Llaves foraneas

- `denuncia_id` → [[table--denuncias-denuncias|denuncias.denuncias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| denuncia_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(15) |
| nombre_original | NVARCHAR(255) |
| nombre_almacenado | NVARCHAR(80) |
| mime_type | NVARCHAR(100) |
| tamano_bytes | INT |
| duracion_segundos | INT |
| hash_sha256 | CHAR(64) |
| creado_en | DATETIMEOFFSET(3) |

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
- `references` → [[table--denuncias-denuncias|denuncias.denuncias]]

## Referenciado por

- [[entity--evidencia-denuncia|EvidenciaDenuncia]] `persisted_in` →
- [[service--denuncias-denuncias|DenunciasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
