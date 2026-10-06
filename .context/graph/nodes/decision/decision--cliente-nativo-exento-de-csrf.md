---
id: decision--cliente-nativo-exento-de-csrf
tipo: DECISION
nombre: El cliente nativo móvil queda exento de la comprobación de Origin del CSRF
nivel: L1
dominio: seguridad
estado: VIGENTE
resumen: "La app Android no envía Origin y no usa cookies; el middleware CSRF la reconoce por la cabecera X-SIGBO-Dispositivo y no le exige Origin, mientras que un navegador sigue obligado."
archivos:
  - backend/src/modules/auth/csrf.middleware.ts
  - .movile/lib/api.dart
edges:
  - [constrains, component--modulo-auth]
  - [constrains, api--auth-auth]
  - [belongs_to, domain--seguridad]
terminos: [csrf, origin, movil, nativo, cabecera, login, 403, bearer, cliente, queda, exento, comprobacion, android, envia, usa, cookies, middleware, reconoce, sigbo, dispositivo, exige, mientras, navegador, sigue, obligado]
---

# El cliente nativo móvil queda exento de la comprobación de Origin del CSRF

La app Android no envía Origin y no usa cookies; el middleware CSRF la reconoce por la cabecera X-SIGBO-Dispositivo y no le exige Origin, mientras que un navegador sigue obligado.

## Por qué

El primer intento de login desde la app devolvió **403**: el middleware pedía `Origin` en
`/auth/login`, `/auth/refresh` y `/auth/logout`, y una app nativa no lo manda. El CSRF
protege sesiones por **cookie** de un navegador; la app usa `Authorization: Bearer`.

## Qué se hizo

`esClienteNativo` acepta la petición cuando trae `X-SIGBO-Dispositivo: movil`. Hay 6
casos de prueba nuevos, incluido que un navegador que falsifique la cabecera **sigue
recibiendo 403** si trae cookie y no trae Origen válido, y que credenciales malas dan 401.

## Costo

La cabecera la puede mandar cualquiera: no es autenticación, solo un indicador de cliente.
La seguridad sigue en el JWT, los permisos y el límite de intentos
([[rule--bloqueo-tras-cinco-intentos]]).


## Archivos

- `backend/src/modules/auth/csrf.middleware.ts`
- `.movile/lib/api.dart`

## Relaciones

- `constrains` → [[component--modulo-auth|auth (modulo NestJS)]]
- `constrains` → [[api--auth-auth|AuthController]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo **curado** (editable a mano).</sub>
