---
id: decision--app-movil-offline-primero
tipo: DECISION
nombre: La app móvil trabaja sin conexión y sincroniza después
nivel: L1
resumen: Todo lo que la app registra se guarda primero en el celular y se envía en orden al volver la red; el servidor acepta lo que llega tarde pero acota la hora que declara el dispositivo.
estado: VIGENTE
dominio: asistencia
fuente: .movile/lib/offline.dart
archivos: [.movile/lib/offline.dart, .movile/lib/outbox.dart, backend/src/shared/utils/instante.ts]
terminos: [offline, sin conexion, cola, sincronizar, idempotencia, celular, app, outbox]
edges:
  - [constrains, component--modulo-app-movil]
  - [constrains, component--modulo-llamados]
  - [constrains, component--modulo-campo]
---

## Decisión

Un cuartel puede quedarse sin señal justo cuando más se necesita registrar. Por eso cada
acción de la app (llamado, despacho, fichaje, ausencia, foto, firma) se encola localmente y
se reenvía sola. El túnel hacia la PC es opcional.

## Cómo

- Cola persistente y **ordenada**; cada operación termina *hecha*, *reintentable* o
  *rechazada* (según el código HTTP) y las rechazadas quedan visibles para una persona.
- Despachos y llamados llevan **id generado por el cliente** y claves de idempotencia, para
  que un reenvío no duplique.
- La hora del hecho viaja como `ocurridoEn`/`tomadoEn` y el servidor la acota:
  [[rule--hora-del-hecho-acotada]].

## Costo aceptado

- Hay dos fuentes de verdad por un rato: lo que el celular cree y lo que el servidor tiene.
- La pantalla no se refresca sola al sincronizar (defecto conocido, ver `.context/MOVIL.md`).
- Los mapas no funcionan sin conexión (política de OpenStreetMap sobre descargas masivas).
