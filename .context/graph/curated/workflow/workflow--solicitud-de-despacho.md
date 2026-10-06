---
id: workflow--solicitud-de-despacho
tipo: WORKFLOW
nombre: Solicitud de despacho: de la creación a la llegada
nivel: L1
resumen: Quien coordina crea la solicitud (chofer, personal o rápida); el sistema decide a quién se le puede enviar; cada persona confirma, responde y avanza hasta llegar; todo queda en una línea de tiempo inmutable.
dominio: servicios
fuente: backend/src/modules/despacho/despacho.service.ts
archivos: [backend/src/modules/despacho/despacho.service.ts, backend/src/modules/despacho/despacho.logica.ts, .context/DESPACHO.md]
terminos: [despacho, solicitud, chofer, personal, rapida, respuesta, en camino, llegada, ampliar, cerrar]
edges:
  - [contains, rule--entrega-y-respuesta-son-ejes-distintos]
  - [contains, rule--linea-de-tiempo-inmutable]
  - [contains, rule--hora-del-hecho-acotada]
---

1. **Crear** (`despacho:solicitar`): `CHOFER` exige uno o más móviles ("Se solicita chofer para: Móvil 1 + Móvil 3");
   `PERSONAL` y `RAPIDA` no piden nada. Con clave de idempotencia, un reintento no duplica.
2. **Evaluar a cada persona** activa con `despacho:responder` (menos quien crea): entrega y causa. Se guarda una
   fila por persona y un evento `ENTREGA`; solo a las `ENVIADA` les llega el aviso por el stream.
3. **Recibir:** el dispositivo confirma (`recibida`) → `RECIBIDA`; si estaba sin conexión → `VISTA_TARDIA`.
4. **Responder:** aceptar / no puedo (motivo) / cancelar / en camino / llegué, con la máquina de estados y 409 ante conflicto.
5. **Buscar personal adicional** (`ampliar`): avisa a no disponibles en línea; quien acepta queda al llamado temporal.
6. **Cerrar o cancelar** (`cerrar`): una solicitud cerrada no admite respuestas; cancelar libera a quien venía en camino.
7. **Seguir** (`despacho:seguimiento`): grupos de respuesta y línea de tiempo.
