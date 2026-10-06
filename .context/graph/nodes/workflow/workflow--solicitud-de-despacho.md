---
id: workflow--solicitud-de-despacho
tipo: WORKFLOW
nombre: "Solicitud de despacho: de la creación a la llegada"
nivel: L1
dominio: servicios
resumen: "Quien coordina crea la solicitud (chofer, personal o rápida); el sistema decide a quién se le puede enviar; cada persona confirma, responde y avanza hasta llegar; todo queda en una línea de tiempo inmutable."
archivos:
  - backend/src/modules/despacho/despacho.service.ts
  - backend/src/modules/despacho/despacho.logica.ts
  - .context/DESPACHO.md
edges:
  - [contains, rule--entrega-y-respuesta-son-ejes-distintos]
  - [contains, rule--linea-de-tiempo-inmutable]
  - [contains, rule--hora-del-hecho-acotada]
  - [belongs_to, domain--servicios]
terminos: [despacho, solicitud, chofer, personal, rapida, respuesta, en camino, llegada, ampliar, cerrar, creacion, quien, coordina, crea, sistema, decide, puede, enviar, cada, persona, confirma, responde, avanza, hasta, llegar, todo, queda, linea, tiempo, inmutable]
---

# Solicitud de despacho: de la creación a la llegada

Quien coordina crea la solicitud (chofer, personal o rápida); el sistema decide a quién se le puede enviar; cada persona confirma, responde y avanza hasta llegar; todo queda en una línea de tiempo inmutable.

1. **Crear** (`despacho:solicitar`): `CHOFER` exige uno o más móviles ("Se solicita chofer para: Móvil 1 + Móvil 3");
   `PERSONAL` y `RAPIDA` no piden nada. Con clave de idempotencia, un reintento no duplica.
2. **Evaluar a cada persona** activa con `despacho:responder` (menos quien crea): entrega y causa. Se guarda una
   fila por persona y un evento `ENTREGA`; solo a las `ENVIADA` les llega el aviso por el stream.
3. **Recibir:** el dispositivo confirma (`recibida`) → `RECIBIDA`; si estaba sin conexión → `VISTA_TARDIA`.
4. **Responder:** aceptar / no puedo (motivo) / cancelar / en camino / llegué, con la máquina de estados y 409 ante conflicto.
5. **Buscar personal adicional** (`ampliar`): avisa a no disponibles en línea; quien acepta queda al llamado temporal.
6. **Cerrar o cancelar** (`cerrar`): una solicitud cerrada no admite respuestas; cancelar libera a quien venía en camino.
7. **Seguir** (`despacho:seguimiento`): grupos de respuesta y línea de tiempo.


## Archivos

- `backend/src/modules/despacho/despacho.service.ts`
- `backend/src/modules/despacho/despacho.logica.ts`
- `.context/DESPACHO.md`

## Relaciones

- `contains` → [[rule--entrega-y-respuesta-son-ejes-distintos|En una solicitud, "se pudo enviar" y "qué respondió" son ejes distintos y no se mezclan]]
- `contains` → [[rule--linea-de-tiempo-inmutable|La línea de tiempo de una solicitud solo se agrega: la base rechaza UPDATE y DELETE]]
- `contains` → [[rule--hora-del-hecho-acotada|La hora que declara un dispositivo se acota antes de guardarse]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[workflow--servicio-activo|Servicio activo: incorporarse, comunicarse y completar formularios]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
