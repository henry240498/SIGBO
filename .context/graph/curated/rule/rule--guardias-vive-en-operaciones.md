---
id: rule--guardias-vive-en-operaciones
tipo: RULE
nombre: Guardias es un modulo propio cuyas tablas viven en el esquema operaciones
nivel: L1
resumen: El modulo NestJS guardias tiene prefijo de permisos guardias, pero sus siete tablas estan en el esquema operaciones, no en uno propio. Es la trampa de nombres mas grande del proyecto.
severidad: ALTA
dominio: guardias
archivos: [backend/src/modules/guardias, database/migrations/025_guardias.sql]
terminos: [guardias, operaciones, asistencia, esquema, schema, modulo, prefijo, nombre, dominio]
edges:
  - [affects, component--modulo-guardias]
  - [affects, entity--grupo-guardia]
  - [affects, entity--pernocte]
---

## El desajuste, en una tabla

| Capa | Nombre |
|---|---|
| Modulo NestJS | `guardias` |
| Prefijo de permisos | `guardias:` |
| Slug de frontend y rutas | `guardias` |
| **Esquema SQL** | **`operaciones`** |

No existe un esquema `guardias`. Sus tablas —`guardias`, `grupos_guardia`,
`grupos_guardia_miembros`, `pernoctes`, `novedades_guardia`,
`inspecciones_estacion`, `requisitos_rol_guardia`— estan todas en `operaciones`,
junto con las de asistencia.

## Y el otro desajuste, el de al lado

`operaciones` es tambien el modulo NestJS de **Asistencia**, cuyo prefijo de permisos
es `asistencia:`. Es decir, en el esquema `operaciones` conviven dos dominios
funcionales:

```
esquema operaciones
├── asistencia  → modulo NestJS "operaciones", permisos "asistencia:"
└── guardias    → modulo NestJS "guardias",    permisos "guardias:"
```

**No existe el prefijo `operaciones:`.** Buscar permisos por ese nombre no devuelve
nada.

## Consecuencia en el grafo

El generador clasifica por la senal honesta de cada capa: las **entidades y tablas**
de guardias quedan bajo el dominio `asistencia` (porque su esquema es `operaciones`),
mientras los **controladores y servicios** quedan bajo `guardias`.

Es incoherente a la vista y es correcto: refleja el repositorio tal como esta. Al
consultar el grafo, buscar por termino (`guardias`, `pernocte`, `grupo`) en vez de
filtrar por `--dominio`, o consultar los dos:

```bash
node .context/graph/context.mjs pernocte grupo guardia --level L2
node .context/graph/context.mjs --dominio guardias
node .context/graph/context.mjs --dominio asistencia
```

## Historia, para entender por que

Guardias empezo adentro de asistencia: hubo pantallas de guardias bajo
`/dashboard/asistencia/guardias` con permisos `asistencia:guardias_*`, y el modulo
del menu estaba en `disponible: false`. Despues se saco a modulo propio con su
prefijo, pero **las tablas se quedaron donde estaban** — mover un esquema con datos
es una migracion riesgosa que nadie necesitaba.

Quedan restos de esa etapa: `AsignacionGuardia` y `CambioGuardia` siguen siendo del
lado de asistencia, y existe una pantalla `/dashboard/organizacion/guardias` aparte de
`/dashboard/guardias`.

## Si algun dia se ordena

Mover las tablas a un esquema `guardias` es `ALTER SCHEMA ... TRANSFER` mas actualizar
el `schema:` de siete entidades. Barato en codigo, no gratis en riesgo. Mientras no se
haga, esta regla es lo que evita perder media hora buscando un esquema que no existe.
