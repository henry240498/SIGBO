---
id: rule--reglas-duplicadas-bd-y-codigo
tipo: RULE
nombre: Los invariantes viven en la BD y en el servicio, y hay que cambiar los dos
nivel: L1
resumen: Los CHECK y UNIQUE de las migraciones duplican a proposito las validaciones de los servicios. La BD es la ultima linea de defensa, no la unica.
severidad: CRITICA
edges:
  - [affects, component--modulo-personal]
terminos: [check, unique, constraint, validacion, duplicada, invariante, dto, estado, invariantes, viven, servicio, hay, cambiar, dos, migraciones, duplican, proposito, validaciones, servicios, ultima, linea, defensa, unica]
---

# Los invariantes viven en la BD y en el servicio, y hay que cambiar los dos

Los CHECK y UNIQUE de las migraciones duplican a proposito las validaciones de los servicios. La BD es la ultima linea de defensa, no la unica.

## Por que la duplicacion es intencional

Como toda la logica esta en TypeScript ([[decision--logica-en-typescript]]), la BD
podria no validar nada. Pero valida, y esta bien: un script de carga, una correccion
manual en DBeaver o un bug en un servicio no deben poder dejar datos imposibles.

Reparto de responsabilidades:

| Capa | Responsabilidad |
|---|---|
| DTO + `ValidationPipe` | Forma de la peticion (tipos, requeridos, formato) |
<<<<<<< Updated upstream
| Servicio | Reglas de negocio con contexto (unicidad con mensaje legible, transiciones de estado, elegibilidad) |
=======
| Servicio | Reglas de negocio con contexto (unicidad con mensaje legible, transiciones de estado) |
>>>>>>> Stashed changes
| `CHECK` / `UNIQUE` / FK | Ultima linea: lo que no puede existir jamas en la tabla |

## El costo: cambiar en dos lugares

Al ampliar un conjunto de valores permitidos hay que tocar **los dos lados**:

1. El `export type` de la entidad (TypeScript).
2. El `CHECK` de la tabla, con una migracion nueva.

Solo el paso 1 compila y falla en tiempo de ejecucion al guardar. Ver
[[rule--entidad-y-tabla-en-paralelo]].

## Donde estan estas reglas duplicadas hoy

Los estados de casi todo el dominio: `EstadoServicio`, `EstadoComunicacionServicio`,
<<<<<<< Updated upstream
`EstadoGuardia`, `EstadoGrupoGuardia`, `RolGrupoGuardia`,
`EstadoInspeccionEstacion`, `EstadoEventoAsistencia`, `EstadoEquipo`,
`EstadoVehiculo`, `EstadoPrestamoEquipo`, `EstadoInscripcionCurso`,
`EstadoCambioGuardia`, `EstadoAsignacionGuardia`, `CondicionInstitucional`,
`TipoMarcacion`, `MetodoMarcacion`, `FuenteAsistencia`, `GravedadServicio`,
`TurnoGuardia`, `TipoGuardiaRegistro`.

Cada uno es un `export type` en `shared/entities/` **y** normalmente un `CHECK` en su
migracion. El grafo los expone juntos: el nodo `ENTITY` lista las enumeraciones y el
nodo `TABLE` lista los `CHECK`, de modo que se puede comparar sin abrir los archivos.

**No todos tienen su `CHECK`.** `requisitos_rol_guardia.rol` es texto libre sin
constraint contra `RolGrupoGuardia`. Antes de asumir que la BD protege un enum,
verificar el nodo `TABLE`.

## Validacion estricta de peticiones

`main.ts` usa `whitelist: true` y `forbidNonWhitelisted: true`: un campo que el DTO
no declara **hace fallar** la peticion con 400, no se ignora. Agregar un campo al
=======
`EstadoGuardia`, `EstadoEventoAsistencia`, `EstadoEquipo`, `EstadoVehiculo`,
`EstadoPrestamoEquipo`, `EstadoInscripcionCurso`, `EstadoCambioGuardia`,
`EstadoAsignacionGuardia`, `CondicionInstitucional`, `TipoMarcacion`,
`MetodoMarcacion`, `FuenteAsistencia`, `GravedadServicio`.

Cada uno es un `export type` en `shared/entities/` **y** un `CHECK` en su migracion.
El grafo los expone juntos: el nodo `ENTITY` lista las enumeraciones y el nodo `TABLE`
lista los `CHECK`, de modo que se puede comparar sin abrir los archivos.

## Validacion estricta de peticiones

`main.ts` usa `whitelist: true` y `forbidNonWhitelisted: true`: un campo que el DTO no
declara **hace fallar la peticion** con 400, no se ignora. Agregar un campo al
>>>>>>> Stashed changes
frontend sin agregarlo al DTO rompe el endpoint.


## Relaciones

- `affects` → [[component--modulo-personal|personal (modulo NestJS)]]

## Referenciado por

- [[decision--logica-en-typescript|Cero procedimientos almacenados, toda la logica vive en TypeScript]] `constrains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
