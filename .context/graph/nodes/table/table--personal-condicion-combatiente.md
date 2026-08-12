---
id: table--personal-condicion-combatiente
tipo: TABLE
nombre: personal.condicion_combatiente
nivel: L2
dominio: personal
resumen: Tabla personal.condicion_combatiente (6 columnas). Creada en 016_personal_expansion.sql.
tabla: condicion_combatiente
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, condicion, combatiente, bombero, disponibilidad, operativa, nivel, entrenamiento, horas, operativas, actualizado]
---

# personal.condicion_combatiente

Tabla personal.condicion_combatiente (6 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 6
- **UNIQUE:** `bombero_id`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| disponibilidad_operativa | BIT |
| nivel_entrenamiento | NVARCHAR(50) |
| horas_operativas | INT |
| actualizado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--condicion-combatiente|CondicionCombatiente]] `persisted_in` →
- [[service--personal-condicion|CondicionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
