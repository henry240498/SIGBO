---
id: component--modulo-control-personal
tipo: COMPONENT
nombre: control-personal (modulo NestJS)
nivel: L1
dominio: asistencia
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de control-personal.
capa: backend
archivos:
  - backend/src/modules/control-personal/control-personal.module.ts
edges:
  - [belongs_to, domain--asistencia]
terminos: [control, personal, modulo]
---

# control-personal (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de control-personal.


## Archivos

- `backend/src/modules/control-personal/control-personal.module.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]

## Referenciado por

- [[service--control-personal-avisos-vencimiento|AvisosVencimientoService]] `uses` →
- [[service--control-personal-fichaje|FichajeService]] `uses` →
- [[service--control-personal-horas-servicio|HorasServicioService]] `uses` →
- [[service--control-personal-vencimientos|VencimientosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
