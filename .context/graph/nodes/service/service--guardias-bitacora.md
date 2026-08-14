---
id: service--guardias-bitacora
tipo: SERVICE
nombre: BitacoraService
nivel: L2
dominio: guardias
resumen: "SIGBO debe funcionar como concentrador de informacion de la guardia, no como base de datos aislada (seccion 33 del pedido): esta bitacora NUNCA duplica almacenamiento, solo consulta lo ya registrado en cada modulo (Asistencia, Servicios, Equipos, Eventos) dentro de la ventana horaria real de la guardia (`GuardiasService.rangoGuardia`), mas lo propio de Guardias (personal, pernoctes, inspecciones, novedades manuales)."
capa: backend
archivos:
  - backend/src/modules/guardias/bitacora.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--marcacion-asistencia]
  - [reads, table--operaciones-marcaciones-asistencia]
  - [uses, entity--servicio]
  - [reads, table--servicios-servicios]
  - [uses, entity--evento-asistencia]
  - [reads, table--operaciones-eventos-asistencia]
  - [uses, entity--participante-evento]
  - [reads, table--operaciones-participantes-evento]
  - [uses, entity--prestamo-equipo]
  - [reads, table--equipos-prestamos-equipos]
  - [uses, entity--pernocte]
  - [reads, table--operaciones-pernoctes]
  - [uses, entity--inspeccion-estacion]
  - [reads, table--operaciones-inspecciones-estacion]
  - [uses, entity--inspeccion-movil]
  - [reads, table--operaciones-inspecciones-movil]
  - [uses, entity--novedad-guardia]
  - [reads, table--operaciones-novedades-guardia]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, service--guardias-guardias]
  - [uses, service--seguridad-auditoria]
terminos: [bitacora, guardias, bombero, marcacion, asistencia, servicio, evento, participante, prestamo, equipo, pernocte, inspeccion, estacion, movil, novedad, guardia, usuario]
---

# BitacoraService

SIGBO debe funcionar como concentrador de informacion de la guardia, no como base de datos aislada (seccion 33 del pedido): esta bitacora NUNCA duplica almacenamiento, solo consulta lo ya registrado en cada modulo (Asistencia, Servicios, Equipos, Eventos) dentro de la ventana horaria real de la guardia (`GuardiasService.rangoGuardia`), mas lo propio de Guardias (personal, pernoctes, inspecciones, novedades manuales).


## Metodos

`obtener()` · `cerrar()` · `reabrir()`

## Archivos

- `backend/src/modules/guardias/bitacora.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--marcacion-asistencia|MarcacionAsistencia]]
- `reads` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]
- `uses` → [[entity--servicio|Servicio]]
- `reads` → [[table--servicios-servicios|servicios.servicios]]
- `uses` → [[entity--evento-asistencia|EventoAsistencia]]
- `reads` → [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]]
- `uses` → [[entity--participante-evento|ParticipanteEvento]]
- `reads` → [[table--operaciones-participantes-evento|operaciones.participantes_evento]]
- `uses` → [[entity--prestamo-equipo|PrestamoEquipo]]
- `reads` → [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]]
- `uses` → [[entity--pernocte|Pernocte]]
- `reads` → [[table--operaciones-pernoctes|operaciones.pernoctes]]
- `uses` → [[entity--inspeccion-estacion|InspeccionEstacion]]
- `reads` → [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]]
- `uses` → [[entity--inspeccion-movil|InspeccionMovil]]
- `reads` → [[table--operaciones-inspecciones-movil|operaciones.inspecciones_movil]]
- `uses` → [[entity--novedad-guardia|NovedadGuardia]]
- `reads` → [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[service--guardias-guardias|GuardiasService]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--guardias-bitacora|BitacoraController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
