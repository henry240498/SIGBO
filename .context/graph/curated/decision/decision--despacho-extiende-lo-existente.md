---
id: decision--despacho-extiende-lo-existente
tipo: DECISION
nombre: El despacho operativo extiende llamados, convocatorias y flota en lugar de crear un sistema paralelo
nivel: L1
resumen: Las solicitudes de despacho enlazan llamado_id y servicio_id, reutilizan permisos, auditoría y el patrón SSE; las alertas y convocatorias existentes siguen funcionando mientras la app migra.
estado: VIGENTE
dominio: servicios
fuente: .context/DESPACHO.md
archivos: [.context/DESPACHO.md, backend/src/modules/despacho, database/migrations/088_despacho_nucleo.sql]
terminos: [despacho, coordinacion, solicitud, chofer, personal, disponibilidad, tiempo real, sse]
edges:
  - [constrains, component--modulo-llamados]
  - [constrains, component--modulo-flota]
---

## Decisión

El relevamiento previo (2026-10-06) mostró que ya existían alertas de chofer/apoyo, llamados,
convocatorias con VOY/NO_PUEDO, despachos de móviles, RBAC con permisos por usuario, auditoría y un SSE.
Faltaba lo central: **disponibilidad declarada, destinatarios segmentados con causa de no entrega,
respuestas reversibles y línea de tiempo inmutable**. El módulo agrega exactamente eso y se enlaza con lo demás.

## Costo aceptado

- Conviven dos mecanismos parecidos (alertas/convocatorias y solicitudes de despacho) hasta que la app
  migre; hay que decidir cuándo retirar el viejo.
- Tiempo real en memoria (una instancia) y **sin push con la app cerrada**: ver `.context/DESPACHO.md`, sección 7.
- Autorización por rol y permiso; rango y cargo no se usan todavía para autorizar.
