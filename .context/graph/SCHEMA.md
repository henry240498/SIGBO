---
tipo: META
nivel: L0
---

# Contrato de normalización del grafo

<<<<<<< Updated upstream
Este archivo es el **contrato**. Todo nodo y toda arista deben encajar en los tipos
declarados acá. Si hace falta un tipo nuevo, se agrega primero en este archivo, después
en `build-graph.mjs` y después en la lista de `validar.mjs`; nunca al revés.
=======
Este archivo es el **contrato**. Todo nodo y toda arista del grafo deben encajar en
los tipos declarados acá. Si hace falta un tipo nuevo, se agrega primero en este
archivo y después en `build-graph.mjs`; nunca al revés.
>>>>>>> Stashed changes

## 1. Principio rector: el grafo no es la fuente de verdad

| Capa | Fuente de verdad | Rol |
|---|---|---|
| Implementación | `backend/src/`, `frontend/src/` | Qué hace el sistema |
| Estructura persistida | `database/migrations/` | Qué se guarda y con qué reglas |
| Conocimiento humano | `docs/` | Por qué y para quién |
| **Relaciones** | **`.context/graph/`** | **Qué se conecta con qué** |

<<<<<<< Updated upstream
El grafo es un **índice semántico** derivado de las tres primeras capas. Cuando el grafo
y el código discrepan, **el código gana** y el grafo está desactualizado.

Consecuencia práctica: los nodos derivados **no se editan a mano**. Se regeneran. Solo
los nodos de `graph/curated/` se escriben a mano, porque codifican conocimiento que no
es deducible de ningún archivo (decisiones, reglas de negocio, fallas conocidas).
=======
El grafo es un **índice semántico** derivado de las tres primeras capas. Cuando el
grafo y el código discrepan, **el código gana** y el grafo está desactualizado.

Consecuencia práctica: los nodos derivados **no se editan a mano**. Se regeneran.
Solo los nodos de `graph/curated/` se escriben a mano, porque codifican conocimiento
que no está deducible de ningún archivo (decisiones, reglas de negocio, fallas
conocidas).
>>>>>>> Stashed changes

## 2. Tipos de nodo

| Tipo | Origen | Derivado | Qué representa |
|---|---|---|---|
<<<<<<< Updated upstream
| `DOMAIN` | `frontend/src/lib/modulos.ts` + esquemas SQL | sí | Un módulo funcional (Personal, Guardias…) |
=======
| `DOMAIN` | `frontend/src/lib/modulos.ts` + módulos NestJS | sí | Un módulo funcional del sistema (Personal, Servicios…) |
>>>>>>> Stashed changes
| `ENTITY` | `backend/src/shared/entities/*.entity.ts` | sí | Un concepto del dominio con identidad y persistencia |
| `TABLE` | `database/migrations/*.sql` | sí | Una tabla física, con sus constraints |
| `SERVICE` | `backend/src/modules/**/*.service.ts` | sí | Lógica de negocio del backend |
| `API` | `backend/src/modules/**/*.controller.ts` | sí | Superficie HTTP: prefijo, rutas, permisos exigidos |
| `SCREEN` | `frontend/src/app/**/page.tsx` | sí | Una pantalla navegable |
| `COMPONENT` | `*.module.ts`, `frontend/src/lib/*`, componentes compartidos | sí | Pieza de código reutilizable o de composición |
<<<<<<< Updated upstream
| `CONFIGURATION` | `configuracion.registry.ts`, `data-source-options.ts` | sí | Parámetro que altera el comportamiento sin cambiar código |
| `FILE` | migraciones | sí | Archivo relevante por sí mismo (una migración *es* un hecho) |
=======
| `CONFIGURATION` | `configuracion.registry.ts`, `data-source-options.ts`, `.env` | sí | Parámetro que altera el comportamiento sin cambiar código |
| `FILE` | migraciones y archivos de infraestructura | sí | Archivo relevante por sí mismo (una migración *es* un hecho) |
>>>>>>> Stashed changes
| `WORKFLOW` | `graph/curated/workflow/` | **no** | Secuencia de pasos con actores y estados |
| `RULE` | `graph/curated/rule/` | **no** | Invariante que el sistema debe cumplir |
| `DECISION` | `graph/curated/decision/` | **no** | Elección tomada, con su motivo y su costo |
| `DEPENDENCY` | `graph/curated/dependency/` | **no** | Tecnología externa de la que dependemos |
| `ERROR` | `graph/curated/error/` | **no** | Falla conocida, su síntoma y su causa |
| `PROCEDURE` | `database/` | sí | Procedimiento/función/vista SQL — **hoy: 0**, toda la lógica vive en TypeScript |

`PROCEDURE` se declara aunque esté vacío: que esté en cero es información
(ver [[decision--logica-en-typescript]]).

### Lo que deliberadamente NO es nodo

<<<<<<< Updated upstream
Los **permisos** (`guardias:asignar`, …) no son nodos. Son 118 códigos que inflarían el
grafo con nodos de una línea. Viven en `indexes/permissions.json` y como atributo
`permisos` de los nodos `API` y `SCREEN` que los exigen. Se buscan igual; no ensucian el
grafo visual.
=======
Los **permisos** (`organizacion:rangos_crear`, …) no son nodos. Son ~110 códigos que
inflarían el grafo con nodos de una línea. Viven en `indexes/permissions.json` y como
atributo `permisos` de los nodos `API` y `SCREEN` que los exigen. Se buscan igual;
no ensucian el grafo visual.
>>>>>>> Stashed changes

Tampoco son nodos los DTOs, guards ni decoradores: aparecen como `archivos` del nodo
`API` o `SERVICE` correspondiente.

## 3. Tipos de arista

Dirigidas, siempre `origen --tipo--> destino`.

| Arista | Origen → Destino | Significado |
|---|---|---|
| `persisted_in` | ENTITY → TABLE | La entidad se materializa en esa tabla |
| `belongs_to` | * → DOMAIN | Pertenencia funcional |
| `exposes` | API → SERVICE | El controlador expone ese servicio por HTTP |
<<<<<<< Updated upstream
| `uses` | SERVICE → ENTITY \| SERVICE, SCREEN → COMPONENT | Dependencia de lógica, repositorio o helper |
| `calls` | SCREEN → API | La pantalla consume ese endpoint |
| `reads` \| `writes` | SERVICE → TABLE | Acceso a datos (inferido de `InjectRepository`) |
| `references` | TABLE → TABLE | Llave foránea |
| `relates_to` | ENTITY → ENTITY | Relación TypeORM — **hoy: 0**, no se usan relaciones del ORM |
| `defined_in` | TABLE → FILE | Migración que crea la tabla |
| `contains` | WORKFLOW → RULE \| DECISION | Paso o regla incluida en el flujo |
=======
| `uses` | SERVICE → ENTITY \| SERVICE | Dependencia de lógica o repositorio |
| `calls` | SCREEN → API | La pantalla consume ese endpoint |
| `reads` \| `writes` | SERVICE → TABLE | Acceso a datos (vía entidad) |
| `references` | TABLE → TABLE | Llave foránea |
| `relates_to` | ENTITY → ENTITY | Relación TypeORM (`@ManyToOne`, `@OneToMany`…) |
| `defined_in` | TABLE → FILE | Migración que crea la tabla |
| `contains` | WORKFLOW → RULE \| WORKFLOW → * | Paso o regla incluida en el flujo |
>>>>>>> Stashed changes
| `affects` | RULE → ENTITY \| TABLE \| SCREEN | Sobre qué actúa el invariante |
| `constrains` | DECISION → * | Qué queda limitado por la decisión |
| `originates_from` | ERROR → COMPONENT \| DEPENDENCY \| CONFIGURATION | Dónde nace la falla |
| `depends_on` | * → DEPENDENCY | Dependencia externa |
| `configured_by` | * → CONFIGURATION | Qué parámetro lo altera |
| `documented_in` | * → FILE | Documento humano que lo explica |
| `supersedes` | DECISION → DECISION | Reemplaza una decisión anterior |

## 4. Formato de un nodo

Un nodo es un `.md` con frontmatter YAML. El cuerpo es para humanos; el frontmatter,
para máquinas. Los wikilinks del cuerpo hacen que Obsidian dibuje el mismo grafo que
`edges.jsonl` describe.

```markdown
---
<<<<<<< Updated upstream
id: rule--elegibilidad-de-rol-guardia
tipo: RULE
nombre: La elegibilidad para un rol de guardia se configura en tablas
nivel: L1
resumen: Una o dos oraciones que digan el invariante completo.
severidad: ALTA
dominio: guardias
fuente: backend/src/modules/guardias/elegibilidad.service.ts
archivos:
  - backend/src/modules/guardias/elegibilidad.service.ts
edges:
  - [affects, entity--requisito-rol-guardia]
terminos: [elegibilidad, requisito, rol, chofer]
---

Cuerpo legible. Enlaces: [[entity--requisito-rol-guardia]].
```

Campos obligatorios: `id`, `tipo`, `nombre`, `nivel`. El resto según tipo.
`RULE` y `ERROR` deben declarar `severidad` (`CRITICA` | `ALTA` | `MEDIA`).
El nombre del archivo debe ser `<id>.md`.

`nivel` es el nivel de contexto **mínimo** en el que el nodo aparece:

- **L0** — el mapa. Dominios y punteros. ~1K tokens.
- **L1** — resumen por dominio: entidades, pantallas, reglas principales.
- **L2** — contexto de tarea: entidad + dependencias + tablas + archivos + reglas.
- **L3** — profundidad: cuerpo completo de los curados, constraints columna por columna.
=======
id: entity--bombero
tipo: ENTITY
nombre: Bombero
dominio: personal
nivel: L1
resumen: Persona registrada en la institución, con código único y condición institucional.
tabla: personal.bomberos
archivos:
  - backend/src/shared/entities/bombero.entity.ts
edges:
  - [persisted_in, table--personal-bomberos]
  - [belongs_to, domain--personal]
terminos: [bombero, personal, cedula, codigo, legajo]
---

Cuerpo legible. Enlaces: [[table--personal-bomberos]].
```

Campos obligatorios: `id`, `tipo`, `nombre`, `nivel`. El resto según tipo.

`nivel` es el nivel de contexto **mínimo** en el que el nodo aparece:

- **L0** — el mapa. Dominios y punteros. Cuesta ~1K tokens leer todo L0.
- **L1** — resumen por dominio: entidades, pantallas, reglas principales.
- **L2** — contexto de tarea: entidad + dependencias + tablas + archivos + reglas.
- **L3** — profundidad: cuerpo completo, constraints columna por columna, rutas.
>>>>>>> Stashed changes

Un agente escala L0 → L1 → L2 → L3 y **se detiene en cuanto puede actuar**. Cargar L3
sin haber necesitado L2 es exactamente el desperdicio que este grafo existe para evitar.

<<<<<<< Updated upstream
## 5. Ponderación de la búsqueda

`context.mjs` pondera cada término por IDF: un término presente en el 15% de los nodos
(`estado`, que es columna de decenas de tablas) pesa ~0.3; uno presente en un solo nodo
(`pernocte`) pesa 1.5. Además descarta la cola: un resultado con menos del 12% del mejor
puntaje es ruido, no contexto.

Sin eso, buscar "estado" devolvía tablas de academia al preguntar por servicios.

## 6. Regla de actualización
=======
## 5. Regla de actualización
>>>>>>> Stashed changes

> El grafo se regenera cuando cambia el **conocimiento estructural**, no en cada consulta.

Cambio estructural = se agrega/renombra una entidad, tabla, controlador, pantalla o
módulo; se toma una decisión de arquitectura; se descubre una falla recurrente.

```bash
<<<<<<< Updated upstream
node .context/graph/build-graph.mjs   # regenera nodos derivados, edges e índices
node .context/graph/validar.mjs       # verifica integridad; sale 1 si hay errores
node .context/graph/context.mjs <términos>   # consulta (no regenera nada)
```

Consultar es gratis. Regenerar es un acto deliberado.

## 7. Límites conocidos del análisis estático

El generador usa expresiones regulares, no un compilador:

- Un decorador con formato inusual puede no parsearse. El generador **avisa** en vez de
  callarse (`stats.json`, `advertencias`).
- Las aristas `SCREEN --calls--> API` se infieren por prefijo de ruta. Un endpoint con
  parámetro en el propio `@Controller` (como `guardias/:guardiaId/novedades`) **no** se
  detecta, porque la pantalla arma la URL interpolando.
- `SERVICE --reads--> TABLE` se infiere de `InjectRepository`, no del SQL real. Un
  `QueryBuilder` que toca otras tablas no aparece.
- El esquema se reproduce aplicando las migraciones en orden (`CREATE`, `sp_rename`,
  `ALTER`, `DROP`), no solo leyendo los `CREATE TABLE`. Aun así, T-SQL dinámico dentro
  de `EXEC(...)` solo se detecta en los casos ya previstos.

Ver [[rule--el-grafo-no-es-la-verdad]].
=======
node .context/graph/build-graph.mjs        # regenera nodos derivados, edges e índices
node .context/graph/context.mjs <términos> # consulta (no regenera nada)
```

Consultar es gratis. Regenerar es un acto deliberado.
>>>>>>> Stashed changes
