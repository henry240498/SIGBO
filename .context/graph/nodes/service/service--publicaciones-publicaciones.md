---
id: service--publicaciones-publicaciones
tipo: SERVICE
nombre: PublicacionesService
nivel: L2
dominio: publicaciones
resumen: Logica de negocio de publicaciones (modulo publicaciones).
capa: backend
archivos:
  - backend/src/modules/publicaciones/publicaciones.service.ts
edges:
  - [belongs_to, domain--publicaciones]
  - [uses, component--modulo-publicaciones]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--tipo-servicio]
  - [reads, table--servicios-tipos-servicio]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--publicacion]
  - [reads, table--contenido-publicaciones]
terminos: [publicaciones, servicio, tipo, bombero, vehiculo, publicacion]
---

# PublicacionesService

Logica de negocio de publicaciones (modulo publicaciones).


## Metodos

<<<<<<< Updated upstream
`listar()` · `crear()` · `actualizar()` · `eliminar()` · `estadisticas()`
=======
`listar()` · `crear()` · `actualizar()` · `eliminar()` · `reemplazar()` · `estadisticas()`
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/publicaciones/publicaciones.service.ts`

## Relaciones

- `belongs_to` → [[domain--publicaciones|Publicaciones]]
- `uses` → [[component--modulo-publicaciones|publicaciones (modulo NestJS)]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--tipo-servicio|TipoServicio]]
- `reads` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--publicacion|Publicacion]]
- `reads` → [[table--contenido-publicaciones|contenido.publicaciones]]

## Referenciado por

- [[api--publicaciones-publicaciones|PublicacionesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
