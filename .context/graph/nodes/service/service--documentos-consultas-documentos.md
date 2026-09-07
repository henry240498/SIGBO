---
id: service--documentos-consultas-documentos
tipo: SERVICE
nombre: ConsultasDocumentosService
nivel: L2
dominio: documentos
resumen: Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 44 del pedido). Nunca modifica, elimina, firma ni aprueba documentos. Respeta exactamente los mismos permisos que ya evaluo el guard del controller que la invoca -- no decide autorizacion por su cuenta.
capa: backend
archivos:
  - backend/src/modules/documentos/consultas-documentos.service.ts
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--modulo-documentos]
  - [uses, entity--documento]
  - [reads, table--documentos-documentos-institucionales]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [consultas, documentos, documento, parametro]
---

# ConsultasDocumentosService

Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 44 del pedido). Nunca modifica, elimina, firma ni aprueba documentos. Respeta exactamente los mismos permisos que ya evaluo el guard del controller que la invoca -- no decide autorizacion por su cuenta.


## Metodos

`buscar()` · `proximosAVencer()`

## Archivos

- `backend/src/modules/documentos/consultas-documentos.service.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--modulo-documentos|documentos (modulo NestJS)]]
- `uses` → [[entity--documento|Documento]]
- `reads` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--documentos-consultas-documentos|ConsultasDocumentosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
