---
id: rule--linea-de-tiempo-inmutable
tipo: RULE
nombre: La línea de tiempo de una solicitud solo se agrega: la base rechaza UPDATE y DELETE
nivel: L1
resumen: servicios.solicitud_eventos tiene un disparador INSTEAD OF UPDATE, DELETE que lanza error; ni el código ni el SQL manual pueden alterar la historia.
severidad: CRITICA
dominio: servicios
fuente: database/migrations/088_despacho_nucleo.sql
archivos: [database/migrations/088_despacho_nucleo.sql, backend/src/modules/despacho/despacho.service.ts]
terminos: [linea de tiempo, inmutable, auditoria, trigger, eventos, solicitud, historial]
edges:
  - [affects, entity--llamado]
---

## Invariante

Cada hecho de una solicitud (creada, entrega a cada persona, recibida, aceptó, no puede, en camino,
llegó, canceló, ampliación, cierre) es una fila de `solicitud_eventos` con `ocurrido_en` (la hora del
hecho, acotada por [[rule--hora-del-hecho-acotada]]) y `registrado_en` (cuándo lo supo el servidor).

El disparador `TR_solicitud_eventos_inmutable` lanza el error 51088 ante cualquier `UPDATE` o
`DELETE`. Verificado el 2026-10-06 con ambos. Es una excepción consciente a
[[decision--logica-en-typescript]]: una garantía de auditoría no puede depender de que el código
se porte bien.

## Otras tablas de evidencia con el mismo disparador (migración 090)

`servicios.servicio_mensajes` (chat), `servicios.formulario_historial` (cada alta o cambio de un formulario) y
`seguridad.navegacion_eventos` (auditoría de navegación). En las tres la base rechaza `UPDATE` y `DELETE`; verificado el
2026-10-06 con la prueba real.

## Consecuencias

- No se puede "corregir" un evento: se agrega otro. Los eventos de prueba **permanecen** para siempre.
- Una migración futura que necesite cambiar esta tabla debe eliminar el disparador, y eso debería
  ser una decisión explícita y revisada.
- La tabla crece sin límite; hace falta una política de archivo antes de que sea un problema.
