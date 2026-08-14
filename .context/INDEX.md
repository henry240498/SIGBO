---
tipo: INDEX
nivel: L0
---

# .context — sistema nervioso del repositorio SIGBO

Este directorio es el **índice semántico** del proyecto: no contiene el conocimiento,
contiene las **relaciones** que permiten encontrarlo. Existe para que un agente (o una
<<<<<<< Updated upstream
persona nueva) pueda trabajar sobre un módulo cargando 1–4K tokens de contexto relevante
en lugar de los ~400K que cuesta leer el repositorio.

> **Regla número uno:** el código es la fuente de verdad. Este grafo dice *dónde mirar*,
> nunca *qué es cierto*. Ver [[rule--el-grafo-no-es-la-verdad]].

## Cómo usarlo (protocolo para agentes)

**No leas este directorio completo.** Consultá el grafo y escalá solo si hace falta:

```bash
node .context/graph/context.mjs <términos>                   # L1, el default
node .context/graph/context.mjs guardias pernocte            # ~1.5K tokens
node .context/graph/context.mjs permisos rol --level L2      # ~3K tokens
node .context/graph/context.mjs --archivo <ruta>             # qué reglas tocan un archivo
node .context/graph/context.mjs --tabla operaciones.guardias # qué se rompe si cambio esta tabla
=======
persona nueva) pueda trabajar sobre un módulo cargando 2–4K tokens de contexto
relevante en lugar de cientos de miles de tokens de repositorio.

> **Regla número uno:** el código es la fuente de verdad. Este grafo dice *dónde
> mirar*, nunca *qué es cierto*. Ver [[rule--el-grafo-no-es-la-verdad]].

## Cómo usarlo (protocolo para agentes)

**No leas este directorio completo.** Consulta el grafo y escala solo si hace falta:

```bash
node .context/graph/context.mjs <términos>                  # L1, el default
node .context/graph/context.mjs comunicacion servicio        # ~1.5K tokens
node .context/graph/context.mjs permisos rol --level L2      # ~3K tokens
node .context/graph/context.mjs --archivo <ruta>             # qué toca este archivo
node .context/graph/context.mjs --tabla servicios.servicios  # qué se rompe si cambio esta tabla
>>>>>>> Stashed changes
node .context/graph/context.mjs --tipo RULE --dominio personal
node .context/graph/context.mjs --mapa                       # L0, el mapa completo
```

El costo en tokens se imprime en stderr al final de cada consulta.

### Los cuatro niveles

| Nivel | Qué trae | Costo típico | Cuándo |
|---|---|---|---|
<<<<<<< Updated upstream
| **L0** | Dominios y punteros | ~1K | "¿qué hay en este proyecto?" |
=======
| **L0** | Dominios y punteros | ~1.5K | "¿qué hay en este proyecto?" |
>>>>>>> Stashed changes
| **L1** | Nodos que coinciden + reglas y decisiones que los rigen | ~1.5K | **default**: alcanza para la mayoría de tareas |
| **L2** | + relaciones directas, tablas, endpoints, archivos | ~3K | vas a modificar código |
| **L3** | + cuerpo completo de los nodos curados | ~4K | necesitás el razonamiento entero |

Escalá L0 → L1 → L2 → L3 y **detenete en cuanto puedas actuar**. Cargar L3 cuando L1
alcanzaba es exactamente el desperdicio que este directorio existe para evitar.

### Después de consultar

<<<<<<< Updated upstream
El contexto termina con una lista de **archivos relevantes**. Abrí solo esos, y solo los
que la tarea necesite. Ese salto —del grafo al archivo exacto— es donde está el ahorro.
=======
El contexto termina con una lista de **archivos relevantes**. Abrí solo esos, y solo
los que la tarea necesite. Ese salto —del grafo al archivo exacto— es donde está el
ahorro real.
>>>>>>> Stashed changes

## Los documentos de este directorio

Curados a mano, para leer completos cuando querés entender, no buscar:

| Documento | Qué responde |
|---|---|
| [PROJECT.md](PROJECT.md) | Qué es SIGBO, en qué estado está, qué funciona y qué no |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Cómo está armado: capas, flujo de un request, puertos |
| [DOMAIN.md](DOMAIN.md) | Los 14 módulos funcionales y sus entidades |
<<<<<<< Updated upstream
| [DATABASE.md](DATABASE.md) | 12 esquemas, 88 tablas, convenciones, migraciones |
| [WORKFLOWS.md](WORKFLOWS.md) | Los flujos con estados: login, guardias, comunicación, asistencia |
| [DECISIONS.md](DECISIONS.md) | Las 10 decisiones de arquitectura y su costo |
| [RULES.md](RULES.md) | Los 21 invariantes que no hay que romper |
=======
| [DATABASE.md](DATABASE.md) | 12 esquemas, 81 tablas, convenciones, migraciones |
| [WORKFLOWS.md](WORKFLOWS.md) | Los flujos con estados: login, comunicación, asistencia |
| [DECISIONS.md](DECISIONS.md) | Las 10 decisiones de arquitectura y su costo |
| [RULES.md](RULES.md) | Los 19 invariantes que no hay que romper |
>>>>>>> Stashed changes
| [graph/SCHEMA.md](graph/SCHEMA.md) | Contrato de tipos y aristas del grafo |

## El grafo

```
graph/
├── SCHEMA.md          contrato de normalización (leer antes de extenderlo)
├── build-graph.mjs    generador: deriva el grafo del repo real
<<<<<<< Updated upstream
├── context.mjs        recuperador: consulta y arma el contexto mínimo
├── validar.mjs        verificador de integridad (enlaces, aristas, contrato)
├── curated/           47 nodos escritos a mano (RULE, DECISION, WORKFLOW, ERROR, DEPENDENCY)
├── nodes/             457 nodos, agrupados por tipo
├── edges/edges.jsonl  1309 aristas dirigidas
└── indexes/           nodes · by-type · by-domain · capabilities · files · tables · permissions · stats
=======
├── context.mjs         recuperador: consulta y arma el contexto mínimo
├── curated/            43 nodos escritos a mano (RULE, DECISION, WORKFLOW, ERROR, DEPENDENCY)
├── validar.mjs         verificador de integridad (enlaces, aristas, contrato)
├── nodes/              405 nodos, agrupados por tipo
├── edges/edges.jsonl   1129 aristas dirigidas
└── indexes/            nodes · by-type · by-domain · capabilities · files · tables · permissions · stats
>>>>>>> Stashed changes
```

### Estado actual del grafo

| | |
|---|---|
<<<<<<< Updated upstream
| Nodos | **457** · 1309 aristas · 1318 términos indexados |
| Derivados del código | 75 ENTITY · 88 TABLE · 55 API · 56 SERVICE · 56 SCREEN · 27 COMPONENT · 29 FILE · 10 CONFIGURATION · 14 DOMAIN |
| Curados a mano | 21 RULE · 10 DECISION · 6 WORKFLOW · 6 ERROR · 4 DEPENDENCY |
| Permisos catalogados | 118 códigos |
| PROCEDURE · relaciones ORM | **0 y 0** — y ambos son datos, no olvidos |

## Regenerar y validar

```bash
node .context/graph/build-graph.mjs
node .context/graph/validar.mjs
=======
| Nodos | **405** · 1129 aristas · 1225 términos indexados |
| Derivados del código | 65 ENTITY · 81 TABLE · 49 API · 49 SERVICE · 47 SCREEN · 21 COMPONENT · 26 FILE · 10 CONFIGURATION · 14 DOMAIN |
| Curados a mano | 19 RULE · 10 DECISION · 5 WORKFLOW · 5 ERROR · 4 DEPENDENCY |
| Permisos catalogados | 111 códigos |
| PROCEDURE | **0** — y eso es un dato, ver [[decision--logica-en-typescript]] |

## Regenerar

```bash
node .context/graph/build-graph.mjs
>>>>>>> Stashed changes
```

Se regenera **cuando cambia el conocimiento estructural** —una entidad, tabla,
controlador, pantalla o módulo nuevo; una decisión tomada; una falla descubierta— no en
cada consulta. Consultar es gratis; regenerar es deliberado.

<<<<<<< Updated upstream
Los nodos de `graph/nodes/` se sobrescriben: **no editarlos a mano**. Lo que se escribe a
mano vive en `graph/curated/`.

`validar.mjs` comprueba que todo wikilink resuelva, que las aristas apunten a nodos
existentes, que los curados cumplan el contrato y que los índices estén sincronizados
con el disco. Sale con código 1 si hay errores, así que sirve en un hook o en CI.
=======
Los nodos de `graph/nodes/` se sobrescriben: **no editarlos a mano**. Lo que se escribe
a mano vive en `graph/curated/`.
>>>>>>> Stashed changes

## Huecos que el grafo detecta hoy

`graph/indexes/stats.json` los publica en cada build:

<<<<<<< Updated upstream
- **14 tablas sin entidad** — esquema listo, backend no construido (academia 4,
  finanzas 2, depósito 2, documentos 1, mantenimientos, `personal.licencias`,
  `historial_medico`, `historial_disciplinario`, `seguridad.restricciones`).
- **0 entidades sin tabla.** Hubo una (`ConfiguracionApariencia`, que apuntaba a una
  tabla renombrada en la migración 014); el generador la reportó como huérfana y se
  eliminó. La verificación sigue corriendo en cada build.
- **5 dominios sin pantalla ni API** — los `disponible: false` de `modulos.ts`.

## ⚠️ Este directorio tiene que estar versionado

Ya se perdió una vez: estaba en `.gitignore` y un barrido de archivos sin seguimiento se
lo llevó completo. Los ~450 nodos derivados volvieron con un comando; los 47 curados
hubo que reescribirlos a mano.

```bash
git add .context && git commit -m "docs(context): indice semantico del repositorio"
```

Ver [[error--context-borrado-del-disco]].

## Obsidian

`.context/.obsidian/` viene configurado. Abrí `.context` como vault y el grafo se navega
visualmente: los wikilinks de cada nodo reproducen las mismas aristas que
`edges.jsonl`. Los colores por tipo de nodo están preconfigurados en la vista de grafo.
=======
- **17 tablas sin entidad** — esquema listo, backend no construido (academia 4,
  finanzas 2, depósito 2, documentos 1, mantenimientos de vehículos/equipos,
  `personal.licencias`, `historial_medico`, `historial_disciplinario`,
  `seguridad.restricciones`, `servicios.historial_servicios`).
- **8 dominios sin pantalla · 6 sin API** — los `disponible: false` de
  `modulos.ts`, más Vehículos y Equipos, que tienen API pero todavía no pantalla.

## Obsidian

`.context/.obsidian/` viene configurado. Abrí `.context` como vault y el grafo se
navega visualmente: los wikilinks de cada nodo reproducen las mismas aristas que
`edges.jsonl`. Los colores por tipo de nodo están preconfigurados en la vista de grafo.

## Validar la integridad del grafo

```bash
node .context/graph/validar.mjs
```

Comprueba que todo wikilink resuelva a un nodo existente, que toda arista apunte a
nodos que existen, que los nodos curados tengan los campos obligatorios y que no haya
nodos huérfanos inesperados. Conviene correrlo después de cada `build-graph.mjs`.
>>>>>>> Stashed changes
