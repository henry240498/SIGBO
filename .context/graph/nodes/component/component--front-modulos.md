---
id: component--front-modulos
tipo: COMPONENT
nombre: modulos
nivel: L2
resumen: "Helper de frontend \"modulos\" (7 exportaciones)."
capa: frontend
archivos:
  - frontend/src/lib/modulos.ts
terminos: [modulos, icono, modulo, grupo, config, grupos, visible, agrupar]
---

# modulos

Helper de frontend "modulos" (7 exportaciones).


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[screen--dashboard|/dashboard]] `uses` →
- [[screen--dashboard-modulo|/dashboard/[modulo]]] `uses` →
- [[decision--pantalla-vive-donde-su-permiso|Una pantalla vive en el modulo cuyo permiso gobierna sus endpoints]] `affects` →
- [[rule--etiqueta-nombra-su-control|Toda etiqueta nombra a su control, y todo th declara su scope]] `affects` →
- [[rule--expediente-una-seccion-un-archivo|El expediente del bombero es una seccion por archivo]] `affects` →
- [[rule--frontend-no-autoriza|El frontend oculta, el backend autoriza]] `affects` →
- [[rule--modulo-visible-por-prefijo|Un modulo aparece en el menu si el usuario tiene algun permiso con su prefijo]] `affects` →
- [[rule--registro-de-pantallas-generado|Pantalla nueva significa regenerar el registro de pantallas]] `affects` →
- [[rule--sin-clases-css-nuevas|No traer librerias de UI, y el color sale de un token y no de un hex]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
