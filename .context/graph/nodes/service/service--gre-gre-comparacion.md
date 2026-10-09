---
id: service--gre-gre-comparacion
tipo: SERVICE
nombre: GreComparacionService
nivel: L2
dominio: matpel
resumen: "Diferencias entre dos versiones cargadas: entradas, guías, filas/celdas y reglas. Las claves son de contenido (identificador + nombre, número de guía, tabla + fila); nunca ids internos, que cambian en cada importación."
capa: backend
archivos:
  - backend/src/modules/gre/gre-comparacion.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
terminos: [gre, comparacion]
---

# GreComparacionService

Diferencias entre dos versiones cargadas: entradas, guías, filas/celdas y reglas. Las claves son de contenido (identificador + nombre, número de guía, tabla + fila); nunca ids internos, que cambian en cada importación.


## Metodos

`if()` · `if()` · `comparar()`

## Archivos

- `backend/src/modules/gre/gre-comparacion.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]

## Referenciado por

- [[api--gre-gre-admin|GreAdminController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
