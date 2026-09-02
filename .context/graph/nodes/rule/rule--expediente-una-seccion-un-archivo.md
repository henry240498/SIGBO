---
id: rule--expediente-una-seccion-un-archivo
tipo: RULE
nombre: El expediente del bombero es una seccion por archivo
nivel: L2
dominio: personal
resumen: "personal/[id] esta partido en un archivo por pestana bajo secciones/, mas expediente.tsx con lo que comparten dos o mas. Una pestana nueva es un archivo nuevo, no lineas al final del que ya existe."
severidad: MEDIA
archivos:
  - frontend/src/app/dashboard/personal/[id]/page.tsx
  - frontend/src/app/dashboard/personal/[id]/expediente.tsx
  - frontend/src/app/dashboard/personal/[id]/secciones
edges:
  - [affects, component--front-modulos]
  - [belongs_to, domain--personal]
terminos: [expediente, personal, bombero, seccion, pestana, tab, archivo, estructura, esta, partido, bajo, secciones, comparten, dos, nueva, nuevo, lineas, final, existe]
---

# El expediente del bombero es una seccion por archivo

personal/[id] esta partido en un archivo por pestana bajo secciones/, mas expediente.tsx con lo que comparten dos o mas. Una pestana nueva es un archivo nuevo, no lineas al final del que ya existe.

## Como esta organizado

`personal/[id]` era **un solo archivo de 3.456 lineas** con 23 componentes adentro. Hoy:

```
personal/[id]/
├── page.tsx          225 lineas -- solo orquestacion: carga el bombero, TABS, y elige
│                                    que seccion mostrar
├── expediente.tsx    112 lineas -- lo que comparten dos o mas secciones
└── secciones/        21 archivos -- una pestana por archivo, 11 a 478 lineas
```

## El criterio con el que se partio

El archivo ya estaba organizado en un componente por pestana, y **las pestanas son la
division que el usuario ve**: no habia que inventar una estructura, solo respetar la que
ya tenia.

Cada tipo, constante o ayudante se ubico **por uso y no por posicion**:

- lo usa una sola seccion -> viaja en el archivo de esa seccion
  (`SeccionSeguros` con `TabSalud`, `FilaFoja` con `TabFoja`, `CAMPOS_DETALLE` con
  `TabCondicion`);
- lo usan dos o mas -> `expediente.tsx` (`Bombero`, `Catalogo`, `cargarCatalogo`,
  `campoTexto`, `MovimientoHistorial`, `formatearFechaHora`);
- lo usa solo la pagina -> se queda en `page.tsx` (`TABS`).

Da igual donde estuviera declarado antes: varios tipos vivian entre dos componentes, no
en el encabezado.

## Al agregar una pestana

1. Un archivo nuevo en `secciones/`, con el componente exportado por nombre.
2. Su entrada en el array `TABS` de `page.tsx` y la linea que la renderiza.
3. Si necesita algo de otra seccion, ese algo sube a `expediente.tsx` -- las secciones
   no se importan entre si salvo un caso deliberado (`TabEquipamiento` usa
   `TabEquipamientoDeposito`).

No agregar la pestana al final de `page.tsx`: es exactamente como el archivo llego a
3.456 lineas.


## Archivos

- `frontend/src/app/dashboard/personal/[id]/page.tsx`
- `frontend/src/app/dashboard/personal/[id]/expediente.tsx`
- `frontend/src/app/dashboard/personal/[id]/secciones`

## Relaciones

- `affects` → [[component--front-modulos|modulos]]
- `belongs_to` → [[domain--personal|Personal]]

---
<sub>Nodo **curado** (editable a mano).</sub>
