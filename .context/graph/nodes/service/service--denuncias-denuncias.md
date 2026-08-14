---
id: service--denuncias-denuncias
tipo: SERVICE
nombre: DenunciasService
nivel: L2
dominio: denuncias
resumen: Logica de negocio de denuncias (modulo denuncias).
capa: backend
archivos:
  - backend/src/modules/denuncias/denuncias.service.ts
edges:
  - [belongs_to, domain--denuncias]
  - [uses, component--modulo-denuncias]
  - [uses, entity--denuncia]
  - [reads, table--denuncias-denuncias]
  - [uses, entity--categoria-denuncia]
  - [reads, table--denuncias-categorias-denuncia]
  - [uses, entity--historial-estado-denuncia]
  - [reads, table--denuncias-historial-estados-denuncia]
  - [uses, entity--evidencia-denuncia]
  - [reads, table--denuncias-evidencias-denuncia]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--tipo-servicio]
  - [reads, table--servicios-tipos-servicio]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--comunicacion-servicio]
  - [reads, table--servicios-comunicaciones-servicio]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, service--seguridad-auditoria]
terminos: [denuncias, denuncia, categoria, historial, estado, evidencia, servicio, tipo, vehiculo, comunicacion, usuario]
---

# DenunciasService

Logica de negocio de denuncias (modulo denuncias).


## Metodos

`categoriasPublicas()` · `categoriasInternas()` · `crearCategoria()` · `actualizarCategoria()` · `buscarServiciosPublicos()` · `asignables()` · `crearPublica()` · `listar()` · `resumen()` · `obtener()` · `cambiarEstado()` · `asignar()` · `leerEvidencia()`

## Archivos

- `backend/src/modules/denuncias/denuncias.service.ts`

## Relaciones

- `belongs_to` → [[domain--denuncias|Denuncias]]
- `uses` → [[component--modulo-denuncias|denuncias (modulo NestJS)]]
- `uses` → [[entity--denuncia|Denuncia]]
- `reads` → [[table--denuncias-denuncias|denuncias.denuncias]]
- `uses` → [[entity--categoria-denuncia|CategoriaDenuncia]]
- `reads` → [[table--denuncias-categorias-denuncia|denuncias.categorias_denuncia]]
- `uses` → [[entity--historial-estado-denuncia|HistorialEstadoDenuncia]]
- `reads` → [[table--denuncias-historial-estados-denuncia|denuncias.historial_estados_denuncia]]
- `uses` → [[entity--evidencia-denuncia|EvidenciaDenuncia]]
- `reads` → [[table--denuncias-evidencias-denuncia|denuncias.evidencias_denuncia]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--tipo-servicio|TipoServicio]]
- `reads` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--comunicacion-servicio|ComunicacionServicio]]
- `reads` → [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--denuncias-denuncias-publicas|DenunciasPublicasController]] `exposes` →
- [[api--denuncias-denuncias|DenunciasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
