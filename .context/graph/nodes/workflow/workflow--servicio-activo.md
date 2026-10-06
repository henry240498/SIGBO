---
id: workflow--servicio-activo
tipo: WORKFLOW
nombre: "Servicio activo: incorporarse, comunicarse y completar formularios"
nivel: L1
dominio: servicios
resumen: "Quien viene en camino o llega se incorpora como participante; chatea con los demás, completa formularios versionados y puede salir; todo queda auditado y lo confidencial se oculta según la matriz."
archivos:
  - backend/src/modules/despacho/servicio-activo.service.ts
  - backend/src/modules/despacho/servicio-activo.logica.ts
  - .movile/lib/servicio_activo.dart
edges:
  - [contains, rule--confidencial-lo-decide-la-matriz]
  - [contains, rule--linea-de-tiempo-inmutable]
  - [contains, workflow--solicitud-de-despacho]
  - [belongs_to, domain--servicios]
terminos: [servicio activo, participante, chat, formulario, historial, mapa, incorporarse, confidencial, servicio, activo, comunicarse, completar, formularios, quien, viene, camino, llega, incorpora, chatea, demas, completa, versionados, puede, salir, todo, queda, auditado, oculta, segun, matriz]
---

# Servicio activo: incorporarse, comunicarse y completar formularios

Quien viene en camino o llega se incorpora como participante; chatea con los demás, completa formularios versionados y puede salir; todo queda auditado y lo confidencial se oculta según la matriz.

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


## Archivos

- `backend/src/modules/despacho/servicio-activo.service.ts`
- `backend/src/modules/despacho/servicio-activo.logica.ts`
- `.movile/lib/servicio_activo.dart`

## Relaciones

- `contains` → [[rule--confidencial-lo-decide-la-matriz|Qué información confidencial ve una persona lo decide la matriz de pantallas, en el backend]]
- `contains` → [[rule--linea-de-tiempo-inmutable|La línea de tiempo de una solicitud solo se agrega: la base rechaza UPDATE y DELETE]]
- `contains` → [[workflow--solicitud-de-despacho|Solicitud de despacho: de la creación a la llegada]]
- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo **curado** (editable a mano).</sub>
