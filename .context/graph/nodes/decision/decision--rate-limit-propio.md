---
id: decision--rate-limit-propio
tipo: DECISION
nombre: "Rate limiting propio en memoria en vez de @nestjs/throttler"
nivel: L2
dominio: denuncias
estado: VIGENTE
resumen: El endpoint publico de denuncias se limita con un guard propio de ventana deslizante por IP, sin agregar dependencias. Valido mientras el backend sea un solo proceso.
archivos:
  - backend/src/modules/denuncias/guards/rate-limit.guard.ts
  - backend/src/modules/denuncias/decorators/rate-limit.decorator.ts
edges:
  - [constrains, api--denuncias-denuncias-publicas]
  - [depends_on, dependency--nestjs]
  - [belongs_to, domain--denuncias]
terminos: [ratelimit, throttler, limite, abuso, spam, publico, ip, 429, ventana, rate, limiting, propio, memoria, vez, nestjs, endpoint, denuncias, limita, guard, deslizante, agregar, dependencias, valido, mientras, sea, solo, proceso]
---

# Rate limiting propio en memoria en vez de @nestjs/throttler

El endpoint publico de denuncias se limita con un guard propio de ventana deslizante por IP, sin agregar dependencias. Valido mientras el backend sea un solo proceso.

## Problema

`POST /api/v1/denuncias/publicas` es **publico** y acepta hasta 25 MB de archivos
(10 MB de audio + 3 × 5 MB de evidencias) con `memoryStorage`. Sin limite, una sola
IP podia crear denuncias en serie y sostener decenas de megabytes en memoria del
proceso.

## Decision

Un `RateLimitGuard` propio, con decorador `@RateLimit({...})` por ruta:

| Ruta | Limite | Penalizacion |
|---|---|---|
| `POST /denuncias/publicas` | 5 por hora por IP | 15 min |
| `GET /denuncias/publicas/categorias` y `/servicios` | 60 por minuto por IP | 1 min |

Los catalogos van holgados porque alimentan el formulario mientras la persona lo
completa; el envio va acotado porque escribe en base y consume memoria.

## Por que no `@nestjs/throttler`

- El backend es **un solo proceso** ([[decision--monolito-modular]]): un contador en
  memoria alcanza.
- El proyecto tiene una linea de dependencias minima y deliberada
  (el frontend tiene tres). Sumar un paquete para 80 lineas no se justifica.
- Necesitabamos control fino del mensaje: 429 con texto para una persona, no
  "ThrottlerException" ([[rule--espanol-y-auditoria]]).

## Costo aceptado y cuando deja de servir

**El contador es por proceso.** Si esto alguna vez corre en mas de una instancia o
detras de un balanceador con varios backends, N instancias multiplican por N el
limite efectivo. En ese escenario hay que mover el contador a un almacen compartido
(Redis) o pasar a `@nestjs/throttler` con su storage. Esta advertencia esta tambien
en el comentario del guard.

Tampoco sobrevive a un reinicio: al levantar el proceso, los contadores arrancan en
cero. Es aceptable para frenar abuso casual y bots simples; no es una defensa contra
un ataque distribuido.

## De donde sale la IP

De `request.ip`, que respeta el `trust proxy` configurado en `main.ts`
(`TRUST_PROXY === 'true' ? 1 : false`). Sin proxy declarado, Express ignora
`X-Forwarded-For`, asi que **no se puede falsear con un header**. Si alguna vez se
pone un proxy adelante, hay que activar esa variable o el limite contara la IP del
balanceador para todo el mundo — es decir, bloquearia a todos juntos.

## Verificacion

`backend/src/modules/denuncias/guards/rate-limit.guard.spec.ts`: 7 casos que cubren
el limite, el aislamiento por IP, el vencimiento de ventana y penalizacion, el cupo
separado por endpoint, las solicitudes sin IP y que el mensaje no filtre jerga
tecnica.


## Archivos

- `backend/src/modules/denuncias/guards/rate-limit.guard.ts`
- `backend/src/modules/denuncias/decorators/rate-limit.decorator.ts`

## Relaciones

- `constrains` → [[api--denuncias-denuncias-publicas|DenunciasPublicasController]]
- `depends_on` → [[dependency--nestjs|NestJS 11 + TypeORM 0.3]]
- `belongs_to` → [[domain--denuncias|Denuncias]]

## Referenciado por

- [[workflow--denuncia-rapida|Denuncia rapida: formulario publico, evidencias y gestion interna]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
