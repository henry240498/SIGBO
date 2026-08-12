---
id: rule--bloqueo-tras-cinco-intentos
tipo: RULE
nombre: Cinco intentos fallidos bloquean la cuenta 15 minutos
nivel: L2
dominio: seguridad
resumen: "Al quinto intento fallido se setea bloqueadoHasta = ahora + 15 minutos. Un login exitoso reinicia el contador a cero."
severidad: ALTA
archivos:
  - backend/src/modules/auth/auth.service.ts
edges:
  - [affects, entity--usuario]
  - [contains, workflow--login-y-sesion]
  - [belongs_to, domain--seguridad]
terminos: [bloqueo, intentos, fallidos, login, 15, minutos, cuenta, contador, cinco, bloquean, quinto, intento, fallido, setea, bloqueado, hasta, ahora, exitoso, reinicia, cero]
---

# Cinco intentos fallidos bloquean la cuenta 15 minutos

Al quinto intento fallido se setea bloqueadoHasta = ahora + 15 minutos. Un login exitoso reinicia el contador a cero.

## El invariante

```ts
const MAX_INTENTOS_FALLIDOS = 5;
const BLOQUEO_MINUTOS = 15;
```

- Cada credencial invalida incrementa `usuarios.intentos_fallidos`.
- Al alcanzar 5, se escribe `bloqueado_hasta = ahora + 15 min`.
- Mientras `bloqueadoHasta > ahora`, el login se rechaza **sin** validar la
  contrasena, con un mensaje que informa la hora de desbloqueo en formato `es-PY`.
- Un login exitoso resetea `intentosFallidos: 0` y `bloqueadoHasta: null`.

## Detalle importante

El contador **no se reinicia solo con el tiempo**. Si alguien acumula 4 intentos
fallidos hoy y vuelve manana, el siguiente error es el quinto y bloquea. Solo un
login exitoso pone el contador en cero.

## Para desbloquear a alguien manualmente

Poner `bloqueado_hasta = NULL` e `intentos_fallidos = 0` en `seguridad.usuarios`.

Existe tambien el flujo administrativo de bloqueo/desbloqueo en `seguridad/usuarios`
(`bloqueo.dto.ts`), que es **distinto** de este bloqueo automatico: el administrativo
es una decision humana, este es una defensa contra fuerza bruta. Comparten campo,
significan cosas distintas.

## Estos numeros no son configurables

Son constantes del modulo, no filas. Es la excepcion al patron dominante del sistema
([[decision--tolerancias-parametrizables]]): las reglas que decide la institucion son
datos, pero las defensas de seguridad son codigo. Si se quisiera hacerlas
configurables, el registro de Configuracion ya tiene el nivel `GLOBAL` para eso —
notar que `operations.sessionMinutes` si esta alli.


## Archivos

- `backend/src/modules/auth/auth.service.ts`

## Relaciones

- `affects` → [[entity--usuario|Usuario]]
- `contains` → [[workflow--login-y-sesion|Login, sesion y refresco de token]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[workflow--login-y-sesion|Login, sesion y refresco de token]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
