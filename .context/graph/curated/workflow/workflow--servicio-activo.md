---
id: workflow--servicio-activo
tipo: WORKFLOW
nombre: Servicio activo: incorporarse, comunicarse y completar formularios
nivel: L1
resumen: Quien viene en camino o llega se incorpora como participante; chatea con los demás, completa formularios versionados y puede salir; todo queda auditado y lo confidencial se oculta según la matriz.
dominio: servicios
fuente: backend/src/modules/despacho/servicio-activo.service.ts
archivos: [backend/src/modules/despacho/servicio-activo.service.ts, backend/src/modules/despacho/servicio-activo.logica.ts, .movile/lib/servicio_activo.dart]
terminos: [servicio activo, participante, chat, formulario, historial, mapa, incorporarse, confidencial]
edges:
  - [contains, rule--confidencial-lo-decide-la-matriz]
  - [contains, rule--linea-de-tiempo-inmutable]
  - [contains, workflow--solicitud-de-despacho]
---

1. **Servicios activos** (`GET /despacho/servicios-activos`): REGISTRADO, DESPACHADO o EN_CURSO, con personas, móviles y quién viene en camino.
2. **Incorporarse**: al salir en camino o llegar en una solicitud vinculada al servicio (automático) o con `unirme`; `mi-estado`
   marca la llegada (EN_SITIO) o la salida (RETIRADO). La disponibilidad de la persona acompaña (EN_SERVICIO / AL_LLAMADO).
3. **Chat**: solo participantes; mensajes cortos (500), con clave de idempotencia para la cola sin conexión; **inmutables**.
4. **Formularios**: las definiciones se filtran por tipo de servicio, rol, permiso y etapa. Borrador → completado → anulado,
   con control de versión (409 si otro lo cambió) y un historial inmutable del antes y el después. Los campos
   confidenciales no se cargan ni se ven sin permiso.
5. **Mapa** (`/servicios/:id/mapa`): estado de cada integrante y de cada móvil; la ubicación exacta solo con permiso confidencial.
6. Todo avisa a los participantes por el stream (`servicio_actualizado`, `mensaje`, `formulario`).

Límite: la app muestra el estado del mapa como lista; no hay mapa gráfico embebido.
