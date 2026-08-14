---
id: rule--el-grafo-no-es-la-verdad
tipo: RULE
nombre: Ante discrepancia entre el grafo y el codigo, gana el codigo
nivel: L0
resumen: .context/ es un indice derivado. Sirve para encontrar y decidir que leer, nunca como evidencia de que algo funciona de cierta manera.
severidad: CRITICA
terminos: [grafo, contexto, verdad, indice, derivado, verificar, desactualizado, fuente]
---

## El invariante

El grafo dice **donde mirar**. El codigo dice **que pasa**.

Antes de afirmarle algo al usuario o de basar un cambio en un dato del grafo, hay que
abrir el archivo que el nodo referencia. El campo `archivos` de cada nodo existe
justamente para que ese salto cueste una sola lectura.

## Por que esta regla es necesaria

Los nodos derivados se generan por analisis estatico con expresiones regulares, no
por compilacion. Limites conocidos:

- Un `@Controller` armado dinamicamente o un decorador con formato inusual puede no
  parsearse.
- Las aristas `SCREEN --calls--> API` se infieren por prefijo de ruta: una llamada con
  la ruta construida en una variable no se detecta.
- `SERVICE --reads--> TABLE` se infiere de `InjectRepository`, no del SQL real. Un
  `QueryBuilder` que toca otras tablas no aparece.
- Los nodos curados fueron ciertos el dia que se escribieron. Su campo `fuente` dice
  contra que se verificaron.

`graph/indexes/stats.json` publica las advertencias del generador y la seccion
`huecos`. Vale la pena mirarla.

## Dos pruebas de que esto pasa de verdad

1. **`docs/README.md` afirma "42 tablas, 10 esquemas".** El generador cuenta **87
   tablas en 11 esquemas** leyendo las migraciones. La documentacion escrita a mano
   quedo atras mientras el esquema crecio.
2. **Este directorio fue borrado del disco una vez** y hubo que reconstruirlo. Los
   ~400 nodos derivados volvieron con un comando; los curados hubo que reescribirlos.
   Es la razon de que el grafo sea regenerable y de que valga la pena versionarlo.

```bash
node .context/graph/build-graph.mjs   # regenerar
node .context/graph/validar.mjs       # verificar integridad
```

Ver [[decision--migraciones-a-mano]] y `graph/SCHEMA.md`, seccion "Regla de actualizacion".
