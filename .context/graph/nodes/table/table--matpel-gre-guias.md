---
id: table--matpel-gre-guias
tipo: TABLE
nombre: matpel.gre_guias
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_guias (6 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_guias
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, guias, version, numero, titulo, original, estado, contenido, referencia]
---

# matpel.gre_guias

Tabla matpel.gre_guias (6 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 6
- **UNIQUE:** `id, version_id`, `version_id, numero`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| numero | CHAR(3) |
| titulo_original | NVARCHAR(500) |
| estado_contenido | NVARCHAR(24) |
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

- [[table--matpel-gre-entradas|matpel.gre_entradas]] `references` →
- [[table--matpel-gre-bloques|matpel.gre_bloques]] `references` →
- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-guia|GreGuia]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
