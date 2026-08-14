---
id: workflow--denuncia-rapida
tipo: WORKFLOW
nombre: "Denuncia rapida: formulario publico, evidencias y gestion interna"
nivel: L1
dominio: denuncias
resumen: Cualquier persona puede denunciar sin autenticarse. El backend genera el codigo DEN-anio-NNNNNN, exige descripcion o audio, detecta el MIME por magic bytes y deja historial de cada cambio de estado.
archivos:
  - backend/src/modules/denuncias/denuncias.service.ts
  - backend/src/modules/denuncias/denuncias-publicas.controller.ts
  - database/migrations/031_denuncias_rapidas.sql
edges:
  - [contains, rule--datos-tecnicos-de-denuncia-restringidos]
  - [contains, decision--rate-limit-propio]
  - [affects, entity--denuncia]
  - [affects, entity--evidencia-denuncia]
  - [affects, entity--historial-estado-denuncia]
  - [affects, entity--categoria-denuncia]
  - [belongs_to, domain--denuncias]
terminos: [denuncia, reclamo, publica, anonima, audio, evidencia, seguimiento, codigo, categoria, geolocalizacion, rapida, formulario, publico, evidencias, gestion, interna, cualquier, persona, puede, denunciar, autenticarse, genera, den, anio, nnnnnn, exige, descripcion, detecta, mime, magic, bytes, deja, historial, cada, cambio, estado]
---

# Denuncia rapida: formulario publico, evidencias y gestion interna

Cualquier persona puede denunciar sin autenticarse. El backend genera el codigo DEN-anio-NNNNNN, exige descripcion o audio, detecta el MIME por magic bytes y deja historial de cada cambio de estado.

## Dos superficies, un servicio

| | Ruta | Autenticacion |
|---|---|---|
| Publica | `/api/v1/denuncias/publicas` | `OptionalJwtAuthGuard` — funciona con y sin sesion |
| Interna | `/api/v1/denuncias` | `JwtAuthGuard` + `PermissionsGuard` |

La pantalla publica es `/denuncias`; la gestion, `/dashboard/denuncias` y
`/dashboard/denuncias/[id]`.

## Maquina de estados

```
NUEVA ──► EN_REVISION ──► ASIGNADA ──► EN_INVESTIGACION ──► RESUELTA ──► CERRADA
  │            │              │                │                │
  └────────────┴──────────────┴────────────────┴────────────────┘
                    DESCARTADA · DUPLICADA
```

Las transiciones estan declaradas en `TRANSICIONES` dentro del servicio, no libres:

- `NUEVA` → `EN_REVISION`, `ASIGNADA`, `DESCARTADA`, `DUPLICADA`
- `EN_REVISION` → `ASIGNADA`, `EN_INVESTIGACION`, `RESUELTA`, `DESCARTADA`, `DUPLICADA`
- `ASIGNADA` → `EN_REVISION`, `EN_INVESTIGACION`, `RESUELTA`, `DESCARTADA`, `DUPLICADA`
- `EN_INVESTIGACION` → `ASIGNADA`, `RESUELTA`, `DESCARTADA`, `DUPLICADA`
- `RESUELTA` → `CERRADA`, `EN_INVESTIGACION`
- `CERRADA`, `DESCARTADA`, `DUPLICADA` → `EN_REVISION`

Los tres estados terminales **se pueden reabrir** hacia `EN_REVISION`. Nada queda
cerrado de forma irreversible.

## Permisos

| Permiso | Alcance |
|---|---|
| `denuncias:ver` | Listado, detalle y descarga de archivos |
| `denuncias:gestionar` | Cambiar de estado dentro del flujo |
| `denuncias:asignar` | Asignar a un usuario (pasa a `ASIGNADA`) |
| `denuncias:cerrar` | **Exigido** para `CERRADA`, `RESUELTA`, `DESCARTADA`, `DUPLICADA` |
| `denuncias:configurar_categorias` | Administrar el catalogo |
| `denuncias:ver_datos_tecnicos` | IP, user agent, GPS, usuario — ver [[rule--datos-tecnicos-de-denuncia-restringidos]] |

`cambiarEstado` exige `gestionar` **o** `cerrar`, y despues valida en el cuerpo que
los cuatro estados de cierre requieran `cerrar`. Tener `gestionar` no alcanza para
cerrar.

## Lo que valida el backend, no el formulario

1. **Descripcion o audio.** `if (!dto.descripcion?.trim() && !audio)` con el mensaje
   *"Contanos brevemente qué ocurrió o grabá un audio"*.
2. **Audio con duracion.** Un audio sin `duracionAudioSegundos` se rechaza: sin
   duracion no se puede mostrar el reproductor ni limitar el largo.
3. **Ubicacion completa o ausente.** Latitud sin longitud (o precision sin latitud)
   se rechaza. Compartir ubicacion es opcional; compartirla a medias, no.
4. **MIME por magic bytes**, no por extension ni por el `Content-Type` del cliente:
   `detectarMime(archivo.buffer)`. Audio debe ser `audio/*`; evidencia, JPG/PNG/WebP/PDF.
5. **Limites:** audio 10 MB, cada evidencia 5 MB, hasta 3 evidencias.

## Lo que el sistema captura solo

`codigo` (secuencia SQL `denuncias.secuencia_codigo` → `DEN-2026-000184`), `ip`
(respeta `trust proxy`), `userAgent` recortado a 500 caracteres, `tipoDispositivo`,
`usuarioId` **desde el token**, `estado: 'NUEVA'`, timestamps y la entrada inicial
del historial con el comentario *"Denuncia recibida"*.

El denunciante nunca elige el estado ni puede enviar su propio `usuarioId`.

## Idempotencia

`claveIdempotencia` en la tabla: un doble clic, un reintento de red o una recarga
producen **una sola** denuncia. Es el mecanismo del punto 24 del pedido, y hay que
mantenerlo si se agrega otra via de creacion.

## Trazabilidad, por duplicado

- `denuncias.historial_estado_denuncia` — el expediente de la denuncia: estado
  anterior, nuevo, usuario, comentario.
- `seguridad.logs_auditoria` — el rastro tecnico, via el servicio de auditoria
  compartido.

Son dos cosas distintas y las dos se escriben. Ver [[rule--espanol-y-auditoria]].

## Evidencias

Se guardan con `guardarBufferPrivado(buffer, extension, 'denuncias')`: nombre
generado por el servidor, nunca el del cliente. Se registra `hashSha256` del
contenido y se conserva `nombreOriginal` sanitizado solo para mostrar. La descarga
pasa por `GET /denuncias/:id/archivos/:archivoId` con `denuncias:ver` — los archivos
**no** se sirven como estaticos publicos, a diferencia de `/uploads`.


## Archivos

- `backend/src/modules/denuncias/denuncias.service.ts`
- `backend/src/modules/denuncias/denuncias-publicas.controller.ts`
- `database/migrations/031_denuncias_rapidas.sql`

## Relaciones

- `contains` → [[rule--datos-tecnicos-de-denuncia-restringidos|La IP, el GPS y el user agent de una denuncia exigen un permiso aparte]]
- `contains` → [[decision--rate-limit-propio|Rate limiting propio en memoria en vez de @nestjs/throttler]]
- `affects` → [[entity--denuncia|Denuncia]]
- `affects` → [[entity--evidencia-denuncia|EvidenciaDenuncia]]
- `affects` → [[entity--historial-estado-denuncia|HistorialEstadoDenuncia]]
- `affects` → [[entity--categoria-denuncia|CategoriaDenuncia]]
- `belongs_to` → [[domain--denuncias|Denuncias]]

---
<sub>Nodo **curado** (editable a mano).</sub>
