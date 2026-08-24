---
id: service--documentos-firmas-documento
tipo: SERVICE
nombre: FirmasDocumentoService
nivel: L2
dominio: documentos
resumen: "Firmantes requeridos de un documento (secciones 9-10 del pedido). Antes de estampar una firma digital automaticamente: verifica que existe, que esta autorizada, y que corresponde al firmante requerido -- nunca confia en que \"tener firmaDigitalUrl cargada\" alcance. Si no esta autorizada, el documento deja esa fila `firmado=false` (espacio para firma manuscrita) hasta que alguien confirme la firma fisica via confirmarManual()."
capa: backend
archivos:
  - backend/src/modules/documentos/firmas-documento.service.ts
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--modulo-documentos]
  - [uses, entity--firma-documento]
  - [reads, table--documentos-firmas-documento]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, service--documentos-documentos]
  - [uses, service--seguridad-auditoria]
terminos: [firmas, documento, documentos, firma, cargo, designacion, bombero, rango]
---

# FirmasDocumentoService

Firmantes requeridos de un documento (secciones 9-10 del pedido). Antes de estampar una firma digital automaticamente: verifica que existe, que esta autorizada, y que corresponde al firmante requerido -- nunca confia en que "tener firmaDigitalUrl cargada" alcance. Si no esta autorizada, el documento deja esa fila `firmado=false` (espacio para firma manuscrita) hasta que alguien confirme la firma fisica via confirmarManual().


## Metodos

`porDocumento()` · `definirFirmantes()` · `firmarAutomatico()` · `confirmarManual()`

## Archivos

- `backend/src/modules/documentos/firmas-documento.service.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--modulo-documentos|documentos (modulo NestJS)]]
- `uses` → [[entity--firma-documento|FirmaDocumento]]
- `reads` → [[table--documentos-firmas-documento|documentos.firmas_documento]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[service--documentos-documentos|DocumentosService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--documentos-firmas-documento|FirmasDocumentoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
