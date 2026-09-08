---
id: error--context-borrado-del-disco
tipo: ERROR
nombre: .context/ desaparecio del disco por estar en .gitignore
nivel: L1
resumen: "Mientras .context/ estuvo ignorado por git, quedo expuesto a que un git clean lo borrara. Paso una vez: los nodos derivados volvieron con un comando, los curados hubo que reescribirlos."
severidad: ALTA
archivos:
  - .gitignore
edges:
  - [originates_from, dependency--nodejs]
terminos: [context, borrado, gitignore, clean, untracked, perdida, recuperar, versionar, desaparecio, disco, estar, mientras, estuvo, ignorado, git, quedo, expuesto, borrara, paso, vez, nodos, derivados, volvieron, comando, curados, hubo, reescribirlos]
---

# .context/ desaparecio del disco por estar en .gitignore

Mientras .context/ estuvo ignorado por git, quedo expuesto a que un git clean lo borrara. Paso una vez: los nodos derivados volvieron con un comando, los curados hubo que reescribirlos.

## Que paso

`.context/` se creo mientras la linea `.context/` estaba en `.gitignore` (bajo
"# Editor"). Un directorio ignorado **y** no versionado es untracked: cualquier
`git clean -fdx`, limpieza de rama o herramienta que barra archivos sin seguimiento
se lo lleva sin preguntar.

Desaparecio todo menos `.obsidian/workspace.json`. No habia copia en ningun lado del
disco y el historial de archivos no tenia los originales, porque crear un archivo nuevo
no genera version previa.

## Que se recupero y que no

| Capa | Recuperacion |
|---|---|
| ~400 nodos derivados, aristas, indices | `node .context/graph/build-graph.mjs` — instantaneo |
| Scripts y documentos raiz | Reescritos |
| 40+ nodos curados | **Reescritos a mano.** No son derivables de nada |

Esa asimetria es la leccion: la mitad del valor de este directorio es reproducible y la
otra mitad es conocimiento humano que solo existe si esta versionado.

## Prevencion

1. **`.context/` tiene que estar versionado en git.** No alcanza con sacarlo del
   `.gitignore`: hay que commitearlo, porque untracked es untracked.

   ```bash
   git add .context && git commit -m "docs(context): indice semantico del repositorio"
   ```

2. Si se quiere ignorar el estado local de Obsidian, ignorar solo eso, no el
   directorio:

   ```gitignore
   .context/.obsidian/workspace.json
   .context/.obsidian/cache
   ```

3. Antes de un `git clean`, revisar que se va a borrar: `git clean -nd`.

## Por que esto es un nodo ERROR y no una anecdota

Porque la falla es estructural, no humana: **un indice de conocimiento que no esta
versionado es un indice que se va a perder**. Y porque explica una decision de diseno
del grafo — que todo lo derivable se regenere con un comando — que de otro modo
pareceria sobreingenieria. Ver [[rule--el-grafo-no-es-la-verdad]].


## Archivos

- `.gitignore`

## Relaciones

- `originates_from` → [[dependency--nodejs|Node.js 20+ y PowerShell como entorno de ejecucion]]

---
<sub>Nodo **curado** (editable a mano).</sub>
