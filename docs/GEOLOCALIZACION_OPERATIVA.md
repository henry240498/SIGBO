# Geolocalización operativa de servicios

## Alcance implementado

La comunicación de servicio permite registrar un destino mediante latitud y longitud,
obtener las coordenadas del dispositivo presente en el lugar y abrir la navegación desde
la lista o el formulario del servicio.

El sistema valida que ambas coordenadas estén presentes y dentro de sus rangos válidos.
El destino queda asociado únicamente al servicio correspondiente.

## Uso para conductores

El conductor puede iniciar la navegación hacia el servicio con Google Maps o Waze. La
aplicación seleccionada calcula la ruta desde la ubicación actual del dispositivo y puede
adaptarla a las condiciones disponibles en ese proveedor.

SIGBO no calcula ni almacena la ruta recorrida en esta fase. Tampoco realiza seguimiento
continuo del conductor: solo persiste el punto de destino del servicio. El acceso a la
ubicación actual requiere autorización expresa del usuario y un contexto seguro HTTPS en
producción.

## Límites de seguridad y operación

- La dirección textual sigue siendo necesaria como referencia operativa.
- Las coordenadas no sustituyen la confirmación radial ni las instrucciones de mando.
- La ubicación debe comprobarse antes del despacho cuando la precisión del dispositivo
  sea insuficiente.
- Los enlaces de navegación se abren fuera de SIGBO y quedan sujetos a la disponibilidad
  del proveedor y la conectividad del dispositivo.
- Una fase posterior podrá incorporar despacho en mapa, estados del móvil y telemetría,
  previa definición institucional de permisos, retención, auditoría y privacidad.

## Trazabilidad normativa

Esta función apoya el registro de la dirección exacta previsto para las comunicaciones de
servicio y no automatiza decisiones reservadas a autoridades ni modifica el mando
operativo. Véase `REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md`, especialmente el artículo
252 y las reglas operativas relacionadas con conductores, móviles y comunicaciones.
