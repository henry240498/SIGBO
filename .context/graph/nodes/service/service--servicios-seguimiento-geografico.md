---
id: service--servicios-seguimiento-geografico
tipo: SERVICE
nombre: SeguimientoGeograficoService
nivel: L2
dominio: servicios
resumen: "\"Seguimiento Geografico y Operativo del Servicio\": ruta planificada, eventos del recorrido y pruebas de comunicacion. Modulo separado de ServiciosService a proposito -- no toca el flujo de la Comunicacion de Servicio (crear/editar/finalizar), solo lee `Servicio` para ubicarlo en el mapa y para resolver el numero de servicio."
capa: backend
archivos:
  - backend/src/modules/servicios/seguimiento/seguimiento-geografico.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-servicios]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--cuartel]
  - [reads, table--organizacion-cuarteles]
  - [uses, entity--vehiculo]
  - [reads, table--vehiculos-vehiculos]
  - [uses, entity--historial-servicio]
  - [reads, table--servicios-historial-servicios]
  - [uses, entity--ruta-planificada-servicio]
  - [reads, table--servicios-rutas-planificadas]
  - [uses, entity--prueba-comunicacion-servicio]
  - [reads, table--servicios-pruebas-comunicacion]
  - [uses, service--seguridad-auditoria]
terminos: [seguimiento, geografico, servicios, servicio, cuartel, vehiculo, historial, ruta, planificada, prueba, comunicacion]
---

# SeguimientoGeograficoService

"Seguimiento Geografico y Operativo del Servicio": ruta planificada, eventos del recorrido y pruebas de comunicacion. Modulo separado de ServiciosService a proposito -- no toca el flujo de la Comunicacion de Servicio (crear/editar/finalizar), solo lee `Servicio` para ubicarlo en el mapa y para resolver el numero de servicio.


## Metodos

`obtenerResumen()` · `guardarRutaPlanificada()` · `eliminarRutaPlanificada()` · `agregarEvento()` · `actualizarEvento()` · `eliminarEvento()` · `agregarPruebaComunicacion()` · `actualizarPruebaComunicacion()` · `eliminarPruebaComunicacion()`

## Archivos

- `backend/src/modules/servicios/seguimiento/seguimiento-geografico.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-servicios|servicios (modulo NestJS)]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--cuartel|Cuartel]]
- `reads` → [[table--organizacion-cuarteles|organizacion.cuarteles]]
- `uses` → [[entity--vehiculo|Vehiculo]]
- `reads` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `uses` → [[entity--historial-servicio|HistorialServicio]]
- `reads` → [[table--servicios-historial-servicios|servicios.historial_servicios]]
- `uses` → [[entity--ruta-planificada-servicio|RutaPlanificadaServicio]]
- `reads` → [[table--servicios-rutas-planificadas|servicios.rutas_planificadas]]
- `uses` → [[entity--prueba-comunicacion-servicio|PruebaComunicacionServicio]]
- `reads` → [[table--servicios-pruebas-comunicacion|servicios.pruebas_comunicacion]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--servicios-seguimiento-geografico|SeguimientoGeograficoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
