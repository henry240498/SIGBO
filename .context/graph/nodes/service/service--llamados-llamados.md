---
id: service--llamados-llamados
tipo: SERVICE
nombre: LlamadosService
nivel: L2
dominio: servicios
resumen: Logica de negocio de llamados (modulo llamados).
capa: backend
archivos:
  - backend/src/modules/llamados/llamados.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-llamados]
  - [uses, service--seguridad-auditoria]
terminos: [llamados]
---

# LlamadosService

Logica de negocio de llamados (modulo llamados).


## Metodos

`crearLlamado()` · `listarLlamados()` · `obtenerLlamado()` · `cambiarEstadoLlamado()` · `vincularServicio()` · `crearConvocatoria()` · `abiertasPara()` · `listarConvocatorias()` · `detalleConvocatoria()` · `responder()` · `marcarEnCamino()` · `cancelarAsistencia()` · `cerrarConvocatoria()`

## Archivos

- `backend/src/modules/llamados/llamados.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-llamados|llamados (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--llamados-llamados|LlamadosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
