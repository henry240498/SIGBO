---
id: table--denuncias-historial-estados-denuncia
tipo: TABLE
nombre: denuncias.historial_estados_denuncia
nivel: L2
dominio: denuncias
resumen: Tabla denuncias.historial_estados_denuncia (7 columnas). Creada en 031_denuncias_rapidas.sql.
tabla: historial_estados_denuncia
archivos:
  - database/migrations/031_denuncias_rapidas.sql
edges:
  - [defined_in, file--031-denuncias-rapidas]
  - [belongs_to, domain--denuncias]
  - [references, table--denuncias-denuncias]
  - [references, table--seguridad-usuarios]
terminos: [denuncias, historial, estados, denuncia, estado, anterior, nuevo, usuario, comentario, fecha]
---

# denuncias.historial_estados_denuncia

Tabla denuncias.historial_estados_denuncia (7 columnas). Creada en 031_denuncias_rapidas.sql.

- **Esquema:** denuncias · **Columnas:** 7

## Llaves foraneas

- `denuncia_id` → [[table--denuncias-denuncias|denuncias.denuncias]]
- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| denuncia_id | UNIQUEIDENTIFIER |
| estado_anterior | NVARCHAR(25) |
| estado_nuevo | NVARCHAR(25) |
| usuario_id | UNIQUEIDENTIFIER |
| comentario | NVARCHAR(MAX) |
| fecha | DATETIMEOFFSET(3) |

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
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--historial-estado-denuncia|HistorialEstadoDenuncia]] `persisted_in` →
- [[service--denuncias-denuncias|DenunciasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
