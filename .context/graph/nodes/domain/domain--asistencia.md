---
id: domain--asistencia
tipo: DOMAIN
nombre: Asistencia
nivel: L0
dominio: asistencia
estado: ACTIVO
resumen: "Modulo funcional \"Asistencia\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [asistencia]
---

# Asistencia

Modulo funcional "Asistencia". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--asignacion-guardia|AsignacionGuardia]] `belongs_to` →
- [[entity--cambio-guardia|CambioGuardia]] `belongs_to` →
- [[entity--evento-asistencia|EventoAsistencia]] `belongs_to` →
- [[entity--grupo-guardia-miembro|GrupoGuardiaMiembro]] `belongs_to` →
- [[entity--grupo-guardia|GrupoGuardia]] `belongs_to` →
- [[entity--guardia|Guardia]] `belongs_to` →
- [[entity--importacion-marcador-fila|ImportacionMarcadorFila]] `belongs_to` →
- [[entity--importacion-marcador|ImportacionMarcador]] `belongs_to` →
- [[entity--inspeccion-estacion|InspeccionEstacion]] `belongs_to` →
- [[entity--marcacion-asistencia|MarcacionAsistencia]] `belongs_to` →
- [[entity--novedad-guardia|NovedadGuardia]] `belongs_to` →
- [[entity--participante-evento|ParticipanteEvento]] `belongs_to` →
- [[entity--participante-externo|ParticipanteExterno]] `belongs_to` →
- [[entity--pernocte|Pernocte]] `belongs_to` →
- [[entity--requisito-rol-guardia|RequisitoRolGuardia]] `belongs_to` →
- [[entity--tolerancia-asistencia|ToleranciaAsistencia]] `belongs_to` →
- [[table--operaciones-eventos-asistencia|operaciones.eventos_asistencia]] `belongs_to` →
- [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]] `belongs_to` →
- [[table--operaciones-guardias|operaciones.guardias]] `belongs_to` →
- [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]] `belongs_to` →
- [[table--operaciones-cambios-guardias|operaciones.cambios_guardias]] `belongs_to` →
- [[table--operaciones-participantes-externos|operaciones.participantes_externos]] `belongs_to` →
- [[table--operaciones-participantes-evento|operaciones.participantes_evento]] `belongs_to` →
- [[table--operaciones-tolerancias-asistencia|operaciones.tolerancias_asistencia]] `belongs_to` →
- [[table--operaciones-importaciones-marcador|operaciones.importaciones_marcador]] `belongs_to` →
- [[table--operaciones-importaciones-marcador-filas|operaciones.importaciones_marcador_filas]] `belongs_to` →
- [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]] `belongs_to` →
- [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]] `belongs_to` →
- [[table--operaciones-pernoctes|operaciones.pernoctes]] `belongs_to` →
- [[table--operaciones-inspecciones-estacion|operaciones.inspecciones_estacion]] `belongs_to` →
- [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]] `belongs_to` →
- [[table--operaciones-requisitos-rol-guardia|operaciones.requisitos_rol_guardia]] `belongs_to` →
- [[component--modulo-operaciones|operaciones (modulo NestJS)]] `belongs_to` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `belongs_to` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `belongs_to` →
- [[service--operaciones-importaciones|ImportacionesService]] `belongs_to` →
- [[service--operaciones-marcaciones|MarcacionesService]] `belongs_to` →
- [[service--operaciones-participantes-externos|ParticipantesExternosService]] `belongs_to` →
- [[service--operaciones-tolerancias|ToleranciasService]] `belongs_to` →
- [[api--operaciones-dashboard-asistencia|DashboardAsistenciaController]] `belongs_to` →
- [[api--operaciones-eventos-asistencia|EventosAsistenciaController]] `belongs_to` →
- [[api--operaciones-importaciones|ImportacionesController]] `belongs_to` →
- [[api--operaciones-marcaciones|MarcacionesController]] `belongs_to` →
- [[api--operaciones-participantes-externos|ParticipantesExternosController]] `belongs_to` →
- [[api--operaciones-tolerancias|ToleranciasController]] `belongs_to` →
- [[screen--dashboard-asistencia-auditoria|/dashboard/asistencia/auditoria]] `belongs_to` →
- [[screen--dashboard-asistencia-eventos|/dashboard/asistencia/eventos]] `belongs_to` →
- [[screen--dashboard-asistencia-eventos-id|/dashboard/asistencia/eventos/[id]]] `belongs_to` →
- [[screen--dashboard-asistencia-externos|/dashboard/asistencia/externos]] `belongs_to` →
- [[screen--dashboard-asistencia|/dashboard/asistencia]] `belongs_to` →
- [[screen--dashboard-asistencia-registro|/dashboard/asistencia/registro]] `belongs_to` →
- [[screen--dashboard-asistencia-tolerancias|/dashboard/asistencia/tolerancias]] `belongs_to` →
- [[decision--tolerancias-parametrizables|Las reglas de asistencia son datos parametrizables, no constantes de codigo]] `belongs_to` →
- [[rule--tolerancia-null-es-la-general|La tolerancia con tipoEventoId NULL es la regla general por defecto]] `belongs_to` →
- [[workflow--asistencia-a-evento|Evento de asistencia, participantes y marcaciones]] `belongs_to` →
- [[workflow--importacion-marcador|Importacion de marcaciones desde el marcador digital]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
