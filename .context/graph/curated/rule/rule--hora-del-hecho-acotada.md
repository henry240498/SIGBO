---
id: rule--hora-del-hecho-acotada
tipo: RULE
nombre: La hora que declara un dispositivo se acota antes de guardarse
nivel: L1
resumen: instanteDelHecho no acepta una hora futura, ni una de más de 72 horas atrás, ni anterior al hito previo; fuera de rango se usa la hora del servidor.
severidad: ALTA
dominio: asistencia
fuente: backend/src/shared/utils/instante.ts
archivos: [backend/src/shared/utils/instante.ts, backend/src/modules/control-personal/fichaje.service.ts]
terminos: [hora, ocurridoEn, tomadoEn, offline, reloj, futuro, 72 horas, fichaje, llamado, despacho]
edges:
  - [affects, entity--llamado]
  - [affects, entity--control-horas-fichaje]
---

## Invariante

Con conexión vale la hora del servidor. Sin conexión la app declara cuándo ocurrió el
hecho y el servidor la usa **solo si** no es futura, no tiene más de 72 horas y no es
anterior al hito previo de la misma cadena (por ejemplo, una llegada antes de la salida).
Si no cumple, se usa la del servidor.

## Por qué

Un celular con el reloj mal puesto, o un reenvío muy tardío, no puede reescribir la
historia de una guardia ni inflar las horas de servicio. Comprobado en un celular real: un
llamado registrado sin red a las 09:37 llegó con 09:37, no con la hora del reenvío.
