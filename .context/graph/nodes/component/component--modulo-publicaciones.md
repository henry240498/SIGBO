---
id: component--modulo-publicaciones
tipo: COMPONENT
nombre: publicaciones (modulo NestJS)
nivel: L1
dominio: publicaciones
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de publicaciones.
capa: backend
archivos:
  - backend/src/modules/publicaciones/publicaciones.module.ts
edges:
  - [belongs_to, domain--publicaciones]
terminos: [publicaciones, modulo]
---

# publicaciones (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de publicaciones.


## Entidades registradas (forFeature)

Servicio, TipoServicio, Bombero, Vehiculo, Publicacion

## Archivos

- `backend/src/modules/publicaciones/publicaciones.module.ts`

## Relaciones

- `belongs_to` → [[domain--publicaciones|Publicaciones]]

## Referenciado por

- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
