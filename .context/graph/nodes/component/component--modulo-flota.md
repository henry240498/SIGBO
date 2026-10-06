---
id: component--modulo-flota
tipo: COMPONENT
nombre: flota (modulo NestJS)
nivel: L1
dominio: vehiculos
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de flota.
capa: backend
archivos:
  - backend/src/modules/flota/flota.module.ts
edges:
  - [belongs_to, domain--vehiculos]
terminos: [flota, modulo]
---

# flota (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de flota.


## Archivos

- `backend/src/modules/flota/flota.module.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]

## Referenciado por

- [[service--flota-disponibilidad|DisponibilidadService]] `uses` →
- [[service--flota-dotacion|DotacionService]] `uses` →
- [[service--flota-flota|FlotaService]] `uses` →
- [[service--flota-informe|InformeService]] `uses` →
- [[decision--despacho-extiende-lo-existente|El despacho operativo extiende llamados, convocatorias y flota en lugar de crear un sistema paralelo]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
