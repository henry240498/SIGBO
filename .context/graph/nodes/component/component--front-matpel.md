---
id: component--front-matpel
tipo: COMPONENT
nombre: matpel
nivel: L2
dominio: matpel
resumen: "Helper de frontend \"matpel\" (16 exportaciones, consume 1 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/matpel.ts
edges:
  - [calls, api--gre-matpel-consulta]
terminos: [matpel, entrada, guia, bloque, celda, apartado, solicitud, lectura, evaluacion, geometria, ficha, certeza, campo, vacio, dato, consulta, descargar, paquete]
---

# matpel

Helper de frontend "matpel" (16 exportaciones, consume 1 endpoint(s)).


## Archivos

- `frontend/src/lib/matpel.ts`

## Relaciones

- `calls` → [[api--gre-matpel-consulta|MatpelConsultaController]]

## Referenciado por

- [[screen--dashboard-matpel|/dashboard/matpel]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
