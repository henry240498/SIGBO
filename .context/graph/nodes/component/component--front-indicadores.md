---
id: component--front-indicadores
tipo: COMPONENT
nombre: indicadores
nivel: L2
resumen: "Helper de frontend \"indicadores\" (8 exportaciones, consume 2 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/indicadores.ts
edges:
  - [calls, api--indicadores-indicadores]
  - [calls, api--indicadores-indicadores]
terminos: [indicadores, estadistica, conteo, operativos, celda, calor, mapa, datos, cargar, formato, duracion]
---

# indicadores

Helper de frontend "indicadores" (8 exportaciones, consume 2 endpoint(s)).


## Archivos

- `frontend/src/lib/indicadores.ts`

## Relaciones

- `calls` → [[api--indicadores-indicadores|IndicadoresController]]
- `calls` → [[api--indicadores-indicadores|IndicadoresController]]

## Referenciado por

- [[screen--dashboard-servicios-indicadores|/dashboard/servicios/indicadores]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
