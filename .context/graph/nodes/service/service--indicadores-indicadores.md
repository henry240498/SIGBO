---
id: service--indicadores-indicadores
tipo: SERVICE
nombre: IndicadoresService
nivel: L2
dominio: servicios
resumen: Logica de negocio de indicadores (modulo indicadores).
capa: backend
archivos:
  - backend/src/modules/indicadores/indicadores.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-indicadores]
terminos: [indicadores]
---

# IndicadoresService

Logica de negocio de indicadores (modulo indicadores).


## Metodos

`if()` · `if()` · `operativos()` · `calor()`

## Archivos

- `backend/src/modules/indicadores/indicadores.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-indicadores|indicadores (modulo NestJS)]]

## Referenciado por

- [[api--indicadores-indicadores|IndicadoresController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
