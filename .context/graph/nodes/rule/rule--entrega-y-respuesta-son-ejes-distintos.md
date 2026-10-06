---
id: rule--entrega-y-respuesta-son-ejes-distintos
tipo: RULE
nombre: "En una solicitud, \"se pudo enviar\" y \"qué respondió\" son ejes distintos y no se mezclan"
nivel: L1
dominio: servicios
resumen: "Cada destinatario tiene entrega (ENVIADA, SIN_CONEXION, NO_DISPONIBLE, FUERA_DE_HORARIO, EN_SERVICIO) y estado (PENDIENTE, ACEPTO, NO_PUEDE, CANCELO, EN_CAMINO, LLEGO); una persona sin conexión nunca figura como que recibió la alerta."
severidad: ALTA
archivos:
  - backend/src/modules/despacho/despacho.logica.ts
  - backend/src/modules/despacho/despacho.service.ts
  - database/migrations/088_despacho_nucleo.sql
edges:
  - [affects, entity--llamado]
  - [belongs_to, domain--servicios]
terminos: [despacho, solicitud, entrega, recepcion, sin conexion, no disponible, auditoria, destinatario, tardia, pudo, enviar, respondio, son, ejes, distintos, mezclan, cada, tiene, enviada, conexion, disponible, fuera, horario, servicio, estado, pendiente, acepto, puede, cancelo, camino, llego, persona, nunca, figura, recibio, alerta]
---

# En una solicitud, "se pudo enviar" y "qué respondió" son ejes distintos y no se mezclan

Cada destinatario tiene entrega (ENVIADA, SIN_CONEXION, NO_DISPONIBLE, FUERA_DE_HORARIO, EN_SERVICIO) y estado (PENDIENTE, ACEPTO, NO_PUEDE, CANCELO, EN_CAMINO, LLEGO); una persona sin conexión nunca figura como que recibió la alerta.

## Invariante

`evaluarEntrega` decide, al enviar, si la alerta se puede entregar y, si no, **por qué**. La causa
queda registrada y no se pisa después. En orden: en camino/en servicio → `EN_SERVICIO`;
`NO_DISPONIBLE` → `NO_DISPONIBLE` (aunque además esté sin conexión: fue su decisión); fuera de
horario sin temporal vigente → `FUERA_DE_HORARIO`; sin stream ni actividad en 90 s → `SIN_CONEXION`;
si no, `ENVIADA`.

Si alguien sin conexión ve la solicitud al reconectar, se registra `VISTA_TARDIA`; **nunca**
`RECIBIDA`, porque esa recepción a tiempo no ocurrió. Puede responder igual, y la respuesta queda
marcada como tardía.

## Cómo se ve si se rompe

La auditoría deja de poder responder "¿quién recibió el llamado?" con verdad. En el seguimiento,
`agruparSeguimiento` separa `sinResponder` (recibió), `enviadasSinConfirmar` y los cuatro grupos de
`noRecibieron`; si se mezclan, cuatro causas distintas aparecen como "no respondió".


## Archivos

- `backend/src/modules/despacho/despacho.logica.ts`
- `backend/src/modules/despacho/despacho.service.ts`
- `database/migrations/088_despacho_nucleo.sql`

## Relaciones

- `affects` → [[entity--llamado|Llamado]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[workflow--solicitud-de-despacho|Solicitud de despacho: de la creación a la llegada]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
