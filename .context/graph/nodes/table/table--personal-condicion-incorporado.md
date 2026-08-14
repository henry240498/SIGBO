---
id: table--personal-condicion-incorporado
tipo: TABLE
nombre: personal.condicion_incorporado
nivel: L2
dominio: personal
resumen: Tabla personal.condicion_incorporado (9 columnas). Creada en 016_personal_expansion.sql.
tabla: condicion_incorporado
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, condicion, incorporado, bombero, fecha, incorporacion, formacion, inicial, cursos, realizados, evaluaciones, estado, preparacion, habilitacion, actualizado]
---

# personal.condicion_incorporado

Tabla personal.condicion_incorporado (9 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 9
- **UNIQUE:** `bombero_id`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| fecha_incorporacion | DATE |
| formacion_inicial | NVARCHAR(MAX) |
| cursos_realizados | NVARCHAR(MAX) |
| evaluaciones | NVARCHAR(MAX) |
| estado_preparacion | NVARCHAR(50) |
| fecha_habilitacion | DATE |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** CondicionController
- **Servicios:** CondicionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--condicion-incorporado|CondicionIncorporado]] `persisted_in` →
- [[service--personal-condicion|CondicionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
