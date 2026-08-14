---
id: table--personal-condicion-apoyo-economico
tipo: TABLE
nombre: personal.condicion_apoyo_economico
nivel: L2
dominio: personal
resumen: Tabla personal.condicion_apoyo_economico (9 columnas). Creada en 016_personal_expansion.sql.
tabla: condicion_apoyo_economico
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, condicion, apoyo, economico, bombero, comision, funcion, responsabilidades, actividades, periodo, inicio, fin, actualizado]
---

# personal.condicion_apoyo_economico

Tabla personal.condicion_apoyo_economico (9 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 9
- **UNIQUE:** `bombero_id`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| comision | NVARCHAR(200) |
| funcion | NVARCHAR(200) |
| responsabilidades | NVARCHAR(MAX) |
| actividades | NVARCHAR(MAX) |
| periodo_inicio | DATE |
| periodo_fin | DATE |
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

- [[entity--condicion-apoyo-economico|CondicionApoyoEconomico]] `persisted_in` →
- [[service--personal-condicion|CondicionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
