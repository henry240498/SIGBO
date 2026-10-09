---
id: table--matpel-gre-reglas
tipo: TABLE
nombre: matpel.gre_reglas
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_reglas (10 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_reglas
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, reglas, version, codigo, tipo, uso, texto, original, condiciones, json, parametros, interpretacion, ejecutable, referencia]
---

# matpel.gre_reglas

Tabla matpel.gre_reglas (10 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 10
- **UNIQUE:** `id, version_id`, `version_id, codigo`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(80) |
| tipo_uso | NVARCHAR(20) |
| texto_original | NVARCHAR(MAX) |
| condiciones_json | NVARCHAR(MAX) |
| parametros_json | NVARCHAR(MAX) |
| version_interpretacion | NVARCHAR(80) |
| ejecutable | BIT |
| referencia_id | UNIQUEIDENTIFIER |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/094_gre_base_documental.sql`

## Relaciones

- `defined_in` → [[file--094-gre-base-documental|094_gre_base_documental.sql]]
- `belongs_to` → [[domain--matpel|matpel]]
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Referenciado por

- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-regla|GreRegla]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
