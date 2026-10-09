---
id: service--gre-gre-proceso
tipo: SERVICE
nombre: GreProcesoService
nivel: L2
dominio: matpel
resumen: "Proceso local de extracción (scripts/matpel). Argumentos fijos por el servidor: el cliente nunca aporta rutas, comandos ni nombres de archivo; solo elige un hash que aparece en el descubrimiento. Sin shell, con límite de tiempo y de salida."
capa: backend
archivos:
  - backend/src/modules/gre/gre-proceso.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
terminos: [gre, proceso]
---

# GreProcesoService

Proceso local de extracción (scripts/matpel). Argumentos fijos por el servidor: el cliente nunca aporta rutas, comandos ni nombres de archivo; solo elige un hash que aparece en el descubrimiento. Sin shell, con límite de tiempo y de salida.


## Metodos

`listar()` · `versiones()` · `catalogo()`

## Archivos

- `backend/src/modules/gre/gre-proceso.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]

## Referenciado por

- [[service--gre-gre-importacion|GreImportacionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
