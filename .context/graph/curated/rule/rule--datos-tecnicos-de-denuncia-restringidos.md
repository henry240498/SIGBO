---
id: rule--datos-tecnicos-de-denuncia-restringidos
tipo: RULE
nombre: La IP, el GPS y el user agent de una denuncia exigen un permiso aparte
nivel: L1
resumen: denuncias:ver alcanza para gestionar una denuncia, pero los datos tecnicos del denunciante solo se devuelven con denuncias:ver_datos_tecnicos.
severidad: ALTA
dominio: denuncias
archivos: [backend/src/modules/denuncias/denuncias.controller.ts, backend/src/modules/denuncias/denuncias.service.ts]
terminos: [ip, gps, useragent, tecnico, privacidad, denuncia, permiso, anonimo]
edges:
  - [affects, entity--denuncia]
  - [affects, api--denuncias-denuncias]
---

## El invariante

`obtener(id, puedeVerTecnicos)` arma el bloque `tecnico` **solo** si el permiso esta
presente:

```ts
tecnico: puedeVerTecnicos
  ? { ip, userAgent, tipoDispositivo, latitud, longitud, precisionUbicacion, ubicacionCapturadaEn, usuarioId }
  : undefined,
```

Y el controlador lo resuelve del token, no de un parametro:

```ts
this.service.obtener(id, user.permisos.includes('denuncias:ver_datos_tecnicos'))
```

Un operador con `denuncias:ver` ve el relato, la categoria, el audio, el servicio y
el historial —todo lo que necesita para gestionar— y **no** ve desde donde se
denuncio.

## Por que importa mas que en otros modulos

Una denuncia puede ser contra un companero de la institucion. Si cualquier operador
ve la IP y las coordenadas de quien denuncio, la denuncia deja de ser segura de
hacer, y el modulo pierde sentido.

El formulario **no promete anonimato** —pide nombre y celular, y el sistema guarda
IP— pero si limita quien accede a esos datos.

## Al extender el modulo

- No agregar `ip`, `latitud`, `longitud`, `userAgent` ni `usuarioId` al listado
  (`listar()`), a un export, a un log de aplicacion ni a una respuesta de error. El
  gate esta en un solo lugar a proposito: si el dato se filtra por otra via, el
  permiso deja de valer.
- Si haces un reporte o un export, replica el mismo condicional.
- El bloque viaja como `undefined`, no como `null` con campos vacios: el frontend no
  debe poder inferir que existe un dato oculto.

Ver [[workflow--denuncia-rapida]] y [[rule--permisos-efectivos]] para como se resuelve
el conjunto de permisos.
