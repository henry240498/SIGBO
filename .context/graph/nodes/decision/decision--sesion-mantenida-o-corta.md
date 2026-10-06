---
id: decision--sesion-mantenida-o-corta
tipo: DECISION
nombre: "La sesión depende de \"Mantener sesión iniciada\": 30 días renovables, 12 horas, o los 7 de siempre"
nivel: L1
dominio: seguridad
estado: VIGENTE
resumen: "El login acepta mantenerSesion; el servidor aplica una política (mantenida deslizante con tope, corta de 12 h, o la estándar) y audita la renovación y la expiración."
archivos:
  - backend/src/modules/auth/auth.service.ts
  - backend/src/modules/auth/dto/login.dto.ts
  - backend/src/modules/auth/auth-sesion.spec.ts
  - .movile/lib/main.dart
  - .movile/lib/api.dart
edges:
  - [constrains, component--modulo-auth]
  - [constrains, api--auth-auth]
  - [belongs_to, domain--seguridad]
terminos: [sesion, mantener, login, refresh, expiracion, renovacion, token, auditoria, 30 dias, 12 horas, depende, iniciada, dias, renovables, horas, siempre, acepta, servidor, aplica, politica, mantenida, deslizante, tope, corta, estandar, audita]
---

# La sesión depende de "Mantener sesión iniciada": 30 días renovables, 12 horas, o los 7 de siempre

El login acepta mantenerSesion; el servidor aplica una política (mantenida deslizante con tope, corta de 12 h, o la estándar) y audita la renovación y la expiración.

## Hallazgo previo

Antes de esto la sesión **no se renovaba**: `fechaExpiracion` se fijaba al iniciar sesión (+7 días) y renovar el
token no la estiraba. Quien usaba la app todos los días igual debía volver a entrar a la semana.

## Decisión

| Elección en el login | Política | Duración |
|---|---|---|
| no se indica (la web, clientes viejos) | `ESTANDAR` | 7 días fijos (`REFRESH_TOKEN_EXPIRATION`), como siempre |
| **Mantener sesión iniciada** | `MANTENIDA` | `SESION_MANTENIDA_DIAS` (30) que **se renuevan con el uso**, con tope `SESION_MANTENIDA_MAX_DIAS` (90) desde el inicio |
| no la marca | `CORTA` | `SESION_CORTA_HORAS` (12), sin renovación más allá |

El modo viaja dentro de `seguridad.sesiones.session_data`, así que `refresh` lo conoce sin que el cliente lo repita
(el controlador sigue llamando `refresh(token)`). El refresh token nunca vive más que su sesión.

## Auditoría (`seguridad.logs_auditoria`)

`LOGIN` (con modo y equipo), `LOGIN_FALLIDO` (con equipo), `SESION_RENOVADA`, `SESION_EXPIRADA` (una sola vez por sesión),
`LOGOUT`.

## Costo aceptado

- Una sesión mantenida de 30 días en un celular perdido es un riesgo: la mitigación es cerrarla desde Seguridad → Sesiones.
- La app propone **no** mantener por defecto (recuerda la última elección). En el cuartel conviene revisar si se prefiere lo contrario.
- La casilla está en la app y en el login de la web; la cookie de renovación del navegador dura lo que la sesión (`duracionSesionMs`).


## Archivos

- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/dto/login.dto.ts`
- `backend/src/modules/auth/auth-sesion.spec.ts`
- `.movile/lib/main.dart`
- `.movile/lib/api.dart`

## Relaciones

- `constrains` → [[component--modulo-auth|auth (modulo NestJS)]]
- `constrains` → [[api--auth-auth|AuthController]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo **curado** (editable a mano).</sub>
