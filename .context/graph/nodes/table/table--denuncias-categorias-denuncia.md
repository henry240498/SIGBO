---
id: table--denuncias-categorias-denuncia
tipo: TABLE
nombre: denuncias.categorias_denuncia
nivel: L2
dominio: denuncias
resumen: Tabla denuncias.categorias_denuncia (7 columnas). Creada en 031_denuncias_rapidas.sql.
tabla: categorias_denuncia
archivos:
  - database/migrations/031_denuncias_rapidas.sql
edges:
  - [defined_in, file--031-denuncias-rapidas]
  - [belongs_to, domain--denuncias]
terminos: [denuncias, categorias, denuncia, nombre, normalizado, orden, activo, creado, actualizado]
---

# denuncias.categorias_denuncia

Tabla denuncias.categorias_denuncia (7 columnas). Creada en 031_denuncias_rapidas.sql.

- **Esquema:** denuncias · **Columnas:** 7
- **UNIQUE:** `nombre_normalizado`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(120) |
| nombre_normalizado | NVARCHAR(120) |
| orden | INT |
| activo | BIT |
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

## Referenciado por

- [[table--denuncias-denuncias|denuncias.denuncias]] `references` →
- [[entity--categoria-denuncia|CategoriaDenuncia]] `persisted_in` →
- [[service--denuncias-denuncias|DenunciasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
