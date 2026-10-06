---
id: domain--servicios
tipo: DOMAIN
nombre: Servicios
nivel: L0
dominio: servicios
estado: ACTIVO
resumen: "Modulo funcional \"Servicios\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [servicios]
---

# Servicios

Modulo funcional "Servicios". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--alerta-emergencia|AlertaEmergencia]] `belongs_to` →
- [[entity--campo|Adjunto]] `belongs_to` →
- [[entity--comunicacion-servicio|ComunicacionServicio]] `belongs_to` →
- [[entity--convocatoria|Convocatoria]] `belongs_to` →
- [[entity--despacho-operativo|DisponibilidadPersonal]] `belongs_to` →
- [[entity--despacho-servicio|ServicioParticipante]] `belongs_to` →
- [[entity--despacho|Despacho]] `belongs_to` →
- [[entity--hidrante|Hidrante]] `belongs_to` →
- [[entity--historial-servicio|HistorialServicio]] `belongs_to` →
- [[entity--llamado|Llamado]] `belongs_to` →
- [[entity--personal-servicio|PersonalServicio]] `belongs_to` →
- [[entity--prueba-comunicacion-servicio|PruebaComunicacionServicio]] `belongs_to` →
- [[entity--punto-riesgo|PuntoRiesgo]] `belongs_to` →
- [[entity--ruta-planificada-servicio|RutaPlanificadaServicio]] `belongs_to` →
- [[entity--servicio|Servicio]] `belongs_to` →
- [[entity--tipo-servicio|TipoServicio]] `belongs_to` →
- [[table--servicios-tipos-servicio|servicios.tipos_servicio]] `belongs_to` →
- [[table--servicios-servicios|servicios.servicios]] `belongs_to` →
- [[table--servicios-personal-servicio|servicios.personal_servicio]] `belongs_to` →
- [[table--servicios-historial-servicios|servicios.historial_servicios]] `belongs_to` →
- [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]] `belongs_to` →
- [[table--servicios-rutas-planificadas|servicios.rutas_planificadas]] `belongs_to` →
- [[table--servicios-pruebas-comunicacion|servicios.pruebas_comunicacion]] `belongs_to` →
- [[table--servicios-alertas-emergencia|servicios.alertas_emergencia]] `belongs_to` →
- [[table--servicios-despachos|servicios.despachos]] `belongs_to` →
- [[table--servicios-llamados|servicios.llamados]] `belongs_to` →
- [[table--servicios-convocatorias|servicios.convocatorias]] `belongs_to` →
- [[table--servicios-convocatoria-respuestas|servicios.convocatoria_respuestas]] `belongs_to` →
- [[table--servicios-hidrantes|servicios.hidrantes]] `belongs_to` →
- [[table--servicios-puntos-riesgo|servicios.puntos_riesgo]] `belongs_to` →
- [[table--servicios-preplanes|servicios.preplanes]] `belongs_to` →
- [[table--servicios-inspecciones-prevencion|servicios.inspecciones_prevencion]] `belongs_to` →
- [[table--servicios-adjuntos|servicios.adjuntos]] `belongs_to` →
- [[table--servicios-victimas-servicio|servicios.victimas_servicio]] `belongs_to` →
- [[table--servicios-disponibilidad-personal|servicios.disponibilidad_personal]] `belongs_to` →
- [[table--servicios-disponibilidad-horarios|servicios.disponibilidad_horarios]] `belongs_to` →
- [[table--servicios-disponibilidad-excepciones|servicios.disponibilidad_excepciones]] `belongs_to` →
- [[table--servicios-solicitudes-despacho|servicios.solicitudes_despacho]] `belongs_to` →
- [[table--servicios-solicitud-moviles|servicios.solicitud_moviles]] `belongs_to` →
- [[table--servicios-solicitud-destinatarios|servicios.solicitud_destinatarios]] `belongs_to` →
- [[table--servicios-solicitud-eventos|servicios.solicitud_eventos]] `belongs_to` →
- [[table--servicios-convocatoria-respuesta-eventos|servicios.convocatoria_respuesta_eventos]] `belongs_to` →
- [[table--servicios-servicio-participantes|servicios.servicio_participantes]] `belongs_to` →
- [[table--servicios-servicio-mensajes|servicios.servicio_mensajes]] `belongs_to` →
- [[table--servicios-formulario-definiciones|servicios.formulario_definiciones]] `belongs_to` →
- [[table--servicios-formulario-respuestas|servicios.formulario_respuestas]] `belongs_to` →
- [[table--servicios-formulario-historial|servicios.formulario_historial]] `belongs_to` →
- [[component--modulo-alertas|alertas (modulo NestJS)]] `belongs_to` →
- [[component--modulo-app-movil|app-movil (modulo NestJS)]] `belongs_to` →
- [[component--modulo-campo|campo (modulo NestJS)]] `belongs_to` →
- [[component--modulo-cartografia|cartografia (modulo NestJS)]] `belongs_to` →
- [[component--modulo-despacho|despacho (modulo NestJS)]] `belongs_to` →
- [[component--modulo-indicadores|indicadores (modulo NestJS)]] `belongs_to` →
- [[component--modulo-llamados|llamados (modulo NestJS)]] `belongs_to` →
- [[component--modulo-notificaciones|notificaciones (modulo NestJS)]] `belongs_to` →
- [[component--modulo-prevencion|prevencion (modulo NestJS)]] `belongs_to` →
- [[component--modulo-servicios|servicios (modulo NestJS)]] `belongs_to` →
- [[service--alertas-alertas|AlertasService]] `belongs_to` →
- [[service--app-movil-app-movil|AppMovilService]] `belongs_to` →
- [[service--campo-adjuntos|AdjuntosService]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
