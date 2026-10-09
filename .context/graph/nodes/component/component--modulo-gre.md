---
id: component--modulo-gre
tipo: COMPONENT
nombre: gre (modulo NestJS)
nivel: L1
dominio: matpel
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de gre.
capa: backend
archivos:
  - backend/src/modules/gre/gre.module.ts
edges:
  - [belongs_to, domain--matpel]
terminos: [gre, modulo]
---

# gre (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de gre.


## Entidades registradas (forFeature)

GreDocumento, GreVersion, GrePagina, GreSeccion, GreReferencia, GreGuia, GreEntrada, GreAlias, GreBloque, GreTabla, GreFila, GreCelda, GreRegla, GreCampoFuente, GreRevision, GreImportacion, GreActivacion, GreActivacionHistorial

## Archivos

- `backend/src/modules/gre/gre.module.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]

## Referenciado por

- [[service--gre-gre-activacion|GreActivacionService]] `uses` →
- [[service--gre-gre-catalogo|GreCatalogoService]] `uses` →
- [[service--gre-gre-comparacion|GreComparacionService]] `uses` →
- [[service--gre-gre-fuentes|GreFuentesService]] `uses` →
- [[service--gre-gre-importacion|GreImportacionService]] `uses` →
- [[service--gre-gre-proceso|GreProcesoService]] `uses` →
- [[service--gre-gre-revision|GreRevisionService]] `uses` →
- [[service--gre-gre-trabajador|GreTrabajadorService]] `uses` →
- [[decision--matpel-catalogo-contexto-versionados|GRE versionada y MATPEL sobre el mismo Servicio y cronología]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
