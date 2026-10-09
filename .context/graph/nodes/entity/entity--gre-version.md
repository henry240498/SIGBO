---
id: entity--gre-version
tipo: ENTITY
nombre: GreVersion
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_versiones
archivos:
  - backend/src/shared/entities/gre-version.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-versiones]
terminos: [gre, version, versiones, matpel, estado, importando, validando, requiere, revision, validada, error]
---

# GreVersion

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-versiones|matpel.gre_versiones]]
- **Columnas mapeadas:** 12

## Estados y enumeraciones

- `EstadoGreVersion`: `IMPORTANDO` · `VALIDANDO` · `REQUIERE_REVISION` · `VALIDADA` · `ERROR`

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** —
- **Servicios:** GreCatalogoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/gre-version.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-versiones|matpel.gre_versiones]]

## Referenciado por

- [[service--gre-gre-catalogo|GreCatalogoService]] `uses` →
- [[decision--matpel-catalogo-contexto-versionados|GRE versionada y MATPEL sobre el mismo Servicio y cronología]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
