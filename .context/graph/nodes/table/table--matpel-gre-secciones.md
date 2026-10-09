---
id: table--matpel-gre-secciones
tipo: TABLE
nombre: matpel.gre_secciones
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_secciones (7 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_secciones
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-paginas]
  - [references, table--matpel-gre-paginas]
terminos: [matpel, gre, secciones, version, titulo, original, orden, pagina, desde, hasta, tratamiento]
---

# matpel.gre_secciones

Tabla matpel.gre_secciones (7 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 7
- **UNIQUE:** `id, version_id`, `version_id, orden`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `version_id, pagina_desde` → [[table--matpel-gre-paginas|matpel.gre_paginas]]
- `version_id, pagina_hasta` → [[table--matpel-gre-paginas|matpel.gre_paginas]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| titulo_original | NVARCHAR(500) |
| orden | INT |
| pagina_desde | INT |
| pagina_hasta | INT |
| tratamiento | NVARCHAR(80) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/094_gre_base_documental.sql`

## Relaciones

- `defined_in` → [[file--094-gre-base-documental|094_gre_base_documental.sql]]
- `belongs_to` → [[domain--matpel|matpel]]
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `references` → [[table--matpel-gre-paginas|matpel.gre_paginas]]
- `references` → [[table--matpel-gre-paginas|matpel.gre_paginas]]

## Referenciado por

- [[table--matpel-gre-referencias|matpel.gre_referencias]] `references` →
- [[table--matpel-gre-bloques|matpel.gre_bloques]] `references` →
- [[table--matpel-gre-tablas|matpel.gre_tablas]] `references` →
- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-seccion|GreSeccion]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
