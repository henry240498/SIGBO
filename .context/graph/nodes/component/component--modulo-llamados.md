---
id: component--modulo-llamados
tipo: COMPONENT
nombre: llamados (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de llamados.
capa: backend
archivos:
  - backend/src/modules/llamados/llamados.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [llamados, modulo]
---

# llamados (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de llamados.


## Archivos

- `backend/src/modules/llamados/llamados.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--llamados-llamados|LlamadosService]] `uses` →
- [[decision--app-movil-offline-primero|La app móvil trabaja sin conexión y sincroniza después]] `constrains` →
- [[decision--despacho-extiende-lo-existente|El despacho operativo extiende llamados, convocatorias y flota en lugar de crear un sistema paralelo]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
