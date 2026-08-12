---
tipo: DECISIONS
nivel: L1
---

# Decisiones de arquitectura

10 decisiones vigentes, cada una con su nodo curado. Todas tienen un **costo aceptado**:
esa sección es la más importante, porque explica qué no vas a poder hacer fácil y por qué
el sistema no está "mal hecho" cuando te choques con el límite.

| # | Decisión | Costo principal |
|---|---|---|
| 1 | [[decision--monolito-modular]] — monolito NestJS, no microservicios | Sin event sourcing ni búsqueda full-text; los límites modulares no los fuerza nada |
| 2 | [[decision--sqlserver-en-vez-de-postgres]] — SQL Server Express | Sin `JSONB`; límite de 10 GB; sin Agent ni TimescaleDB |
| 3 | [[decision--sin-libreria-ui]] — 4 clases CSS y estilos inline | Sin variables CSS: cambiar la paleta es find-and-replace |
| 4 | [[decision--logica-en-typescript]] — cero procedimientos almacenados | Invariantes duplicados entre BD y servicios |
| 5 | [[decision--permisos-dinamicos]] — permisos como datos, no roles fijos | Varias consultas por request, sin caché |
| 6 | [[decision--migraciones-a-mano]] — `synchronize: false` | Toda entidad exige su migración |
| 7 | [[decision--comunicacion-como-json]] — formulario como documento JSON | No se puede consultar por dentro con SQL indexado |
| 8 | [[decision--tolerancias-parametrizables]] — reglas de negocio como datos | Cuatro mecanismos de parametrización coexisten |
| 9 | [[decision--pool-idle-timeout]] — pool que recicla conexiones seguido | Reconexión más frecuente |
| 10 | [[decision--body-parser-8mb]] — body de 8 MB y CORS permisivo | `/uploads` se sirve sin guard de permisos |

## Las tres que más condicionan el trabajo diario

### `synchronize: false` (#6)

Agregar una propiedad `@Column` **no crea la columna**. Agregar un valor a un
`export type` de estados **no lo permite en la base**. Las dos cosas compilan y fallan en
tiempo de ejecución.

Es la causa número uno de "funcionaba en mi cabeza". Ver
[[rule--entidad-y-tabla-en-paralelo]].

### Permisos dinámicos (#5)

Un `@RequirePermission('modulo:accion')` con un código que nadie sembró en
`seguridad.permisos` produce un endpoint que **nadie puede usar jamás**, y el síntoma es
un 403 sin explicación. Un permiso nuevo son dos pasos, no uno. Ver
[[rule--todo-endpoint-mutante-con-permiso]].

### Reglas de negocio como datos (#8)

El patrón dominante del sistema: **si una regla la decide la institución, es una fila**.
Tolerancias de asistencia, requisitos de rol de guardia, parámetros institucionales,
configuración de la app. Si ves un número de negocio literal en un servicio, sospechá.

La excepción son las defensas de seguridad (5 intentos, 15 minutos), que son constantes
a propósito.

## Tensiones sin resolver

Cosas que no son bugs ni decisiones cerradas: son preguntas abiertas que conviene no
responder a medias.

1. **Guardias vive en el esquema `operaciones`.** Es un módulo propio, con permisos
   propios y pantallas propias, pero sus tablas comparten esquema con Asistencia, y
   quedaron pantallas de guardias en los dos lados. Ordenarlo es `ALTER SCHEMA ...
   TRANSFER` más siete `schema:` — barato en código, no gratis en riesgo. Ver
   [[rule--guardias-vive-en-operaciones]].

2. **Tema claro a medio camino.** `configuracion.registry.ts` define
   `tokens.background: '#f3f7f8'` y `appearance.theme: 'auto'`, pero las ~56 pantallas
   tienen el oscuro hardcodeado. Hay que elegir un lado antes de tocar apariencia —
   [[rule--tema-oscuro-fijo]].

3. **Cuatro mecanismos de parametrización.** `organizacion.parametros`,
   `operaciones.tolerancias_asistencia`, `operaciones.requisitos_rol_guardia` y el
   registro de Configuración. Cada uno tiene su razón; al agregar un parámetro, elegir el
   que corresponde en vez de crear un quinto. Y ojo: **sus defaults son opuestos** —
   tolerancia ausente es restrictiva, requisito ausente es permisivo.

4. **`ON DELETE CASCADE` sobre documentos formales.** Una comunicación `FINALIZADA` se
   borra si alguien borra el servicio. Si el registro tiene valor legal, la FK debería ser
   `NO ACTION` y obligar a anular primero — [[rule--una-comunicacion-por-servicio]].

5. **Sin caché de permisos.** Correcto hoy (los cambios surten efecto de inmediato) y
   costoso si crece el uso. Ponerle caché obliga a invalidar en cinco puntos distintos —
   [[rule--permisos-efectivos]].

6. **Croquis embebido en base64.** Cada guardado retransmite la imagen completa y engorda
   la fila. La solución estructural es subirlo a `/uploads` y guardar la referencia; la
   infraestructura ya existe (`multer`) — [[error--413-croquis-grande]].

7. **Sin pruebas automatizadas.** No es una decisión documentada, es una ausencia. Con 55
   controladores y 88 tablas, toda verificación es manual. Es la deuda que hace más
   riesgoso cada uno de los cambios de esta lista.

## Al tomar una decisión nueva

Escribí un nodo en `.context/graph/curated/decision/` con este frontmatter mínimo:

```yaml
---
id: decision--<slug>
tipo: DECISION
nombre: <qué se decidió, en una línea>
nivel: L1
resumen: <una o dos oraciones>
estado: VIGENTE
edges:
  - [constrains, <nodo afectado>]
---
```

Y en el cuerpo: **Contexto**, **Decisión**, **Motivo**, **Costo aceptado**, y si aplica
**Cuándo reconsiderar**. La sección de costo no es opcional: una decisión sin costo
documentado es una que nadie va a poder revisar con criterio después.

Después: `node .context/graph/build-graph.mjs && node .context/graph/validar.mjs`.
