---
id: workflow--login-y-sesion
tipo: WORKFLOW
nombre: Login, sesion y refresco de token
nivel: L1
resumen: Credenciales validadas con bcrypt, sesion persistida en seguridad.sesiones, access token corto y refresh token largo. El 401 dispara un reintento automatico en el cliente.
dominio: seguridad
archivos: [backend/src/modules/auth/auth.service.ts, frontend/src/lib/api.ts]
terminos: [login, sesion, token, refresh, jwt, bcrypt, 401, logout, localstorage]
edges:
  - [contains, rule--bloqueo-tras-cinco-intentos]
  - [contains, rule--permisos-efectivos]
  - [affects, entity--sesion]
  - [affects, entity--usuario]
---

## Pasos

1. **`POST /api/v1/auth/login`** con `{ usernameOrEmail, password }`.
2. Se busca el usuario por username **o** email.
3. **Si `bloqueadoHasta > ahora`** → se rechaza sin comparar la contrasena, informando
   la hora de desbloqueo. Ver [[rule--bloqueo-tras-cinco-intentos]].
4. Se compara la contrasena con bcrypt. Si falla: `intentosFallidos + 1`, y al llegar
   a 5 se escribe `bloqueadoHasta = ahora + 15 min`.
5. Si acierta: `intentosFallidos = 0`, `bloqueadoHasta = null`.
6. Se calculan los **permisos efectivos** con el Policy Engine
   ([[rule--permisos-efectivos]]).
7. Se emiten `accessToken` y `refreshToken`, y se persiste la sesion en
   `seguridad.sesiones`.
8. La respuesta (`Sesion`) trae `usuario` con `roles`, `permisos` y
   `debeCambiarPassword`. El cliente la guarda en `localStorage` bajo `sigbo_sesion`.

## Refresco, del lado del cliente

`apiFetch` intercepta el **401**: llama a `/auth/refresh` con el refresh token, y si
obtiene un `accessToken` nuevo **reintenta la peticion original una vez**. Si el
refresh falla, borra la sesion local.

Esto es transparente para las pantallas: no hay que manejar 401 en cada una.

## Consecuencias que importan

- Los permisos del cliente quedan **congelados** hasta el proximo login o refresh: un
  cambio de permisos no se refleja en la interfaz de inmediato, aunque el backend ya
  lo aplique. Ver [[rule--frontend-no-autoriza]].
- `debeCambiarPassword` es la senal para forzar el cambio de contrasena de los usuarios
  semilla.
- `logout` (`POST /auth/logout`) invalida la sesion en el servidor y limpia
  `localStorage`; si la llamada falla, igual limpia el lado del cliente.
- La duracion maxima de sesion es configurable: `operations.sessionMinutes`, default
  480 minutos.
