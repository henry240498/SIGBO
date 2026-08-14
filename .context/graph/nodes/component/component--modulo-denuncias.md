---
id: component--modulo-denuncias
tipo: COMPONENT
nombre: denuncias (modulo NestJS)
nivel: L1
dominio: denuncias
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de denuncias.
capa: backend
archivos:
  - backend/src/modules/denuncias/denuncias.module.ts
edges:
  - [belongs_to, domain--denuncias]
terminos: [denuncias, modulo]
---

# denuncias (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de denuncias.


## Entidades registradas (forFeature)

Denuncia, CategoriaDenuncia, HistorialEstadoDenuncia, EvidenciaDenuncia, Servicio, TipoServicio, Vehiculo, ComunicacionServicio, Usuario

## Archivos

- `backend/src/modules/denuncias/denuncias.module.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
