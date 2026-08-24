---
id: service--servicios-servicios
tipo: SERVICE
nombre: ServiciosService
nivel: L2
dominio: servicios
resumen: Logica de negocio de servicios (modulo servicios).
capa: backend
archivos:
  - backend/src/modules/servicios/servicios.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-servicios]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--tipo-servicio]
  - [reads, table--servicios-tipos-servicio]
  - [uses, entity--comunicacion-servicio]
  - [reads, table--servicios-comunicaciones-servicio]
  - [uses, entity--log-auditoria]
  - [reads, table--seguridad-logs-auditoria]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, service--documentos-documentos]
terminos: [servicios, servicio, tipo, comunicacion, log, auditoria, bombero, vehiculo]
---

# ServiciosService

Logica de negocio de servicios (modulo servicios).


## Metodos

`listar()` · `obtener()` · `catalogos()` · `crear()` · `actualizar()` · `finalizar()` · `enviarRevision()` · `observar()` · `reabrir()` · `anular()` · `eliminar()` · `generarPdf()`

## Archivos

- `backend/src/modules/servicios/servicios.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-servicios|servicios (modulo NestJS)]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--tipo-servicio|TipoServicio]]
- `reads` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `uses` → [[entity--comunicacion-servicio|ComunicacionServicio]]
- `reads` → [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]]
- `uses` → [[entity--log-auditoria|LogAuditoria]]
- `reads` → [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[service--documentos-documentos|DocumentosService]]

## Referenciado por

- [[api--servicios-servicios|ServiciosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
