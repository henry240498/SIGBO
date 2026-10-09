---
id: service--gre-gre-importacion
tipo: SERVICE
nombre: GreImportacionService
nivel: L2
dominio: matpel
resumen: "Importación controlada: la petición HTTP solo encola. Un trabajador local reclama el trabajo con lease, ejecuta la extracción y carga el candidato en una sola transacción. El resultado queda REQUIERE_REVISION: importar nunca valida ni activa una edición."
capa: backend
archivos:
  - backend/src/modules/gre/gre-importacion.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
  - [uses, service--gre-gre-proceso]
  - [uses, service--seguridad-auditoria]
terminos: [gre, importacion]
---

# GreImportacionService

Importación controlada: la petición HTTP solo encola. Un trabajador local reclama el trabajo con lease, ejecuta la extracción y carga el candidato en una sola transacción. El resultado queda REQUIERE_REVISION: importar nunca valida ni activa una edición.


## Metodos

`documentos()` · `solicitar()` · `estado()` · `reclamar()` · `procesarPendientes()` · `procesar()` · `leerArtefacto()`

## Archivos

- `backend/src/modules/gre/gre-importacion.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]
- `uses` → [[service--gre-gre-proceso|GreProcesoService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--gre-gre-trabajador|GreTrabajadorService]] `uses` →
- [[api--gre-gre-admin|GreAdminController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
