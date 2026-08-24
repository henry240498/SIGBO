---
id: entity--categoria-articulo
tipo: ENTITY
nombre: CategoriaArticulo
nivel: L1
dominio: deposito
resumen: "Categoria jerarquica para articulos de inventario por cantidad (guantes, insumos medicos, limpieza, etc). Separada de equipos.categorias_equipo porque ese catalogo es especifico de equipamiento con ficha individual; Deposito cubre un universo mas amplio (consumibles que Equipos nunca modelo)."
tabla: deposito.categorias_articulo
archivos:
  - backend/src/shared/entities/categoria-articulo.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-categorias-articulo]
terminos: [categoria, articulo, categorias, deposito]
---

# CategoriaArticulo

Categoria jerarquica para articulos de inventario por cantidad (guantes, insumos medicos, limpieza, etc). Separada de equipos.categorias_equipo porque ese catalogo es especifico de equipamiento con ficha individual; Deposito cubre un universo mas amplio (consumibles que Equipos nunca modelo).

- **Tabla:** [[table--deposito-categorias-articulo|deposito.categorias_articulo]]
- **Columnas mapeadas:** 5

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** CategoriasArticuloController
- **Servicios:** CategoriasArticuloService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/categoria-articulo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-categorias-articulo|deposito.categorias_articulo]]

## Referenciado por

- [[service--deposito-categorias-articulo|CategoriasArticuloService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
